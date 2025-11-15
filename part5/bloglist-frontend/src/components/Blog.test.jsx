import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import BlogForm from './BlogForm'

test('renders title and author, nothing else', () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'an author is rendered',
    url: 'a url is not rendered',
    likes: 3,
    user: { name: 'user' }
  }

  render(<Blog blog={blog} />)
  screen.debug()

  const title = screen.getByText('Component testing is done with react-testing-library')
  const author = screen.getByText('an author is rendered')
  const url = screen.queryByText('a url is not rendered')
  const likes = screen.queryByText('likes: 3')
  expect(title).toBeDefined()
  expect(author).toBeDefined()
  expect(url).toBeNull()
  expect(likes).toBeNull()
})

test('url and likes are rendered when show button is pressed', async () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'an author is rendered',
    url: 'a url is not rendered',
    likes: 3,
    user: { name: 'user' }
  }


  render(
    <Blog blog={blog} /*toggleVisibility={mockHandler}*/ />
  )

  const user = userEvent.setup()
  const button = screen.getByText('show')
  await user.click(button)


  const url = screen.queryByText('a url is not rendered')
  const likes = screen.queryByText('likes: 3')

  expect(url).toBeDefined()
  expect(likes).toBeDefined()

})

test('event handler is called twice if like button is clicked twice', async () => {

  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'an author is rendered',
    url: 'a url is not rendered',
    likes: 3,
    user: { name: 'user' }
  }

  const mockHandler = vi.fn()

  render(
    <Blog blog={blog} handleLike={mockHandler} />
  )

  const user = userEvent.setup()
  const button = screen.getByText('show')
  await user.click(button)

  const button2 = screen.getByText('like')
  await user.click(button2)
  await user.click(button2)
  expect(mockHandler.mock.calls).toHaveLength(2)

})

test('the form calls the event handler it received as props with the right details when a new blog is created', async () => {

  const addBlog = vi.fn()
  const user = userEvent.setup()

  render(<BlogForm createBlog={addBlog} />)
  screen.debug()

  const createButton = screen.getByText('create')

//   const title = document.querySelector('.titleInput')
//   const author = document.querySelector('.authorInput')
//   const url = document.querySelector('.urlInput')

//   const title = screen.getByRole('textbox', { name: /title/i })
//   const author = screen.getByRole('textbox', { name: /author/i })
//   const url = screen.getByRole('textbox', { name: /url/i })

  const inputs = screen.getAllByRole('textbox')
  const title = inputs[0]
  const author = inputs[1]
  const url = inputs[2]


  await user.type(title, 'test title')
  await user.type(author, 'test author')
  await user.type(url, 'test url')

  await user.click(createButton)

  expect(addBlog.mock.calls).toHaveLength(1)
  expect(addBlog.mock.calls[0][0]).toEqual({
    title: 'test title',
    likes: 0,
    author: 'test author',
    url: 'test url'
  })


})