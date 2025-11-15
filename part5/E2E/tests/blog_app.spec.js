const { test, describe, expect, beforeEach } = require('@playwright/test')

describe('Blog app', () => {

  beforeEach(async ({ page, request }) => {
    
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'john doe',
        username: 'test',
        password: 'salainen'
      }
    })
  await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    const locator = page.getByText(/Login/)
    await expect(locator).toBeVisible()
    await expect(page.getByText('username')).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {

      await page.getByLabel('username').fill('test')
      await page.getByLabel('password').fill('salainen')
      await page.getByRole('button', { name: 'login' }).click()
      await expect(page.getByText('john doe is logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByLabel('username').fill('wrong')
      await page.getByLabel('password').fill('incorrect')
      await page.getByRole('button', { name: 'login' }).click()
      await expect(page.getByText('wrong username or password')).toBeVisible()
    })

  })


  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await page.getByLabel('username').fill('test')
      await page.getByLabel('password').fill('salainen')
  
      await page.getByRole('button', { name: 'login' }).click()
    })

    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'create new blog' }).click()
      await page.getByLabel('title:').fill('testi title')
      await page.getByLabel('author:').fill('testi author')
      await page.getByLabel('url:').fill('testi urli')
      await page.getByRole('button', { name: 'create' }).click()
      await expect(page.getByText('a new blog testi title by testi author added!')).toBeVisible()
    })

    test('a blog can be liked', async ({ page }) => {

      await page.getByRole('button', { name: 'create new blog' }).click()
      await page.getByLabel('title:').fill('testi title')
      await page.getByLabel('author:').fill('testi author')
      await page.getByLabel('url:').fill('testi urli')
      await page.getByRole('button', { name: 'create' }).click()
      
      await page.getByRole('button', { name: 'show' }).click()
      const likesBeforeString = await page.getByText(/likes:/).textContent()
      const likesBefore = parseInt(likesBeforeString.split(':')[1].trim(), 10);

      await page.getByRole('button', { name: 'like' }).click()

      // const likesAfterString = await page.getByText(/likes:/).textContent()
      // const likesAfter = parseInt(likesAfterString.split(':')[1].trim(), 10);
      await expect(page.getByText(/likes:/)).toContainText(`likes: ${likesBefore + 1}`)

      // await expect(likesBefore).toBe(likesAfter-1)
    })

    test('the creator can delete the blog', async ({ page }) => {
      await page.getByRole('button', { name: 'create new blog' }).click()
      await page.getByLabel('title:').fill('testi title')
      await page.getByLabel('author:').fill('testi author')
      await page.getByLabel('url:').fill('testi urli')
      await page.getByRole('button', { name: 'create' }).click()

      await page.getByRole('button', { name: 'show' }).click()

      page.on('dialog', dialog => dialog.accept());

      await page.getByRole('button', { name: 'delete' }).click()
      await expect(page.getByText('a blog testi title by testi author deleted')).toBeVisible()

    })

    test('only the creator sees delete button', async ({ page, request }) => {
     
      await request.post('http://localhost:3003/api/users', {
        data: {
          name: 'jane doe',
          username: 'test2',
          password: 'salaisuus'
        }
      })

      
      await page.getByRole('button', { name: 'create new blog' }).click()
      await page.getByLabel('title:').fill('BlogTest')
      await page.getByLabel('author:').fill('AuthorTest')
      await page.getByLabel('url:').fill('http://google.com')
      await page.getByRole('button', { name: 'create' }).click()
      await expect(page.getByText('BlogTest AuthorTest')).toBeVisible()

      const blog = page.locator('.blog', { hasText: 'BlogTest' })
      await blog.getByRole('button', { name: 'show' }).click()
      await expect(blog.getByRole('button', { name: /delete/i })).toBeVisible()

      
      await page.getByRole('button', { name: 'logout' }).click()
      await expect(page.getByRole('button', { name: 'login' })).toBeVisible()

     
      await page.getByLabel('username').fill('test2')
      await page.getByLabel('password').fill('salaisuus')
      await page.getByRole('button', { name: 'login' }).click()
      await expect(page.getByText('jane doe is logged in')).toBeVisible()

      
      await blog.getByRole('button', { name: 'show' }).click()
      await expect(blog.getByRole('button', { name: /delete/i })).toHaveCount(0)
    })

    test('blogs are ordered by likes, most likes first', async ({ page }) => {
      const blogs = [
        { title: 'Blog 1', author: 'Author 1', url: 'url 1' },
        { title: 'Blog 2', author: 'Author 2', url: 'url 2' },
        { title: 'Blog 3', author: 'Author 3', url: 'url 3' },
      ]

      await page.getByRole('button', { name: 'create new blog' }).click()

      for (const blog of blogs) {
       await page.getByLabel('title:').fill(blog.title)
       await page.getByLabel('author:').fill(blog.author)
       await page.getByLabel('url:').fill(blog.url)
       await page.getByRole('button', { name: 'create' }).click()
       await page.locator('.blog', { hasText: blog.title }).waitFor()
      }

      async function likeBlog(title, times) {
        const blog = page.locator('.blog', { hasText: title })
        await blog.getByRole('button', { name: 'show' }).click()
        const likeButton = blog.getByRole('button', { name: 'like' })
        for (let i = 0; i < times; i++) {
          await likeButton.click()
          await page.waitForTimeout(200)
        }
      }

      await likeBlog('Blog 1', 1)
      await likeBlog('Blog 2', 2)
      await likeBlog('Blog 3', 3)

      const blogElements = page.locator('.blog')
      const count = await blogElements.count()
      const blogLikes = []

    for (let i = 0; i < count; i++) {
      const text = await blogElements.nth(i).textContent()
      const match = text.match(/likes\s*(\d+)/i)
      blogLikes.push(match ? Number(match[1]) : 0)
    }

    for (let i = 0; i < blogLikes.length - 1; i++) {
      expect(blogLikes[i]).toBeGreaterThanOrEqual(blogLikes[i + 1])
    }

    const blogTitles = []
    for (let i = 0; i < count; i++) {
      const text = await blogElements.nth(i).textContent()
      const match = text.match(/Blog [1-3]/)
      blogTitles.push(match ? match[0] : '')
    }

    expect(blogTitles).toEqual(['Blog 3', 'Blog 2', 'Blog 1'])
    })

  })




})