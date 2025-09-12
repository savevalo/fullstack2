const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('node:assert')
const app = require('../app')
const list_helper = require('../utils/list_helper')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('unique identifier is named id', async () => {
  const response = await api.get('/api/blogs')
  const contents = response.body
  
  contents.forEach(blog => {
    // expect(blog.id).toBeDefined()
    assert.ok(blog.id !== undefined)
    assert.ok(blog._id == undefined)
  })
})

test('created successfully', async () => {
  const newBlog = {
    title: "title",
    author: "author",
    url: "some url",
    likes: 3
  }
  const response = await api
    .get('/api/blogs')

  const blogsBefore = response.body.length

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)

  const blogsAtEnd = await list_helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, blogsBefore + 1)

})

test('deleted successfully', async () => {
  const newBlog = {
    title: "title",
    author: "author",
    url: "some url",
    likes: 3
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)

  const blogsBefore = await list_helper.blogsInDb()

  const blogToDelete = blogsBefore[0].id
  
  await api
    .delete('/api/blogs/' + blogToDelete)
    .expect(204)

  const blogsAtEnd = await list_helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, blogsBefore.length - 1)

})

test('likes updated successfully', async () => {
  const newBlog = {
    title: "title",
    author: "author",
    url: "some url",
    likes: 3
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)

  const blogsBefore = await list_helper.blogsInDb()

  const blogToAlter = blogsBefore[(blogsBefore.length-1)]

  const likesBefore = blogToAlter.likes

  const alteredBlog = newBlog
  alteredBlog.likes++

  await api
    .put('/api/blogs/' + blogToAlter.id)
    .send(alteredBlog)
    .expect(200)

  const blogsNow = await list_helper.blogsInDb()
  const likesNow = blogsNow[(blogsNow.length - 1)].likes

  assert.strictEqual(likesBefore, likesNow - 1)

  await api
    .delete('/api/blogs/' + blogToAlter.id)
    .expect(204)
  
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await list_helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await list_helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await list_helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await list_helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})

// const assert = require('node:assert')

// import test, { describe } from 'node:test';
// import assert from 'node:assert';

// const listHelper = require('../utils/list_helper')
// import listHelper from '../utils/list_helper.js'
// import totalLikes from '../utils/list_helper.js'

// describe('total likes', () => {

      
//       test('totalLikes returns the sum of likes'), () => {
//           const blogs = [
//               {
//                 _id: "5a422a851b54a676234d17f7",
//                 title: "React patterns",
//                 author: "Michael Chan",
//                 url: "https://reactpatterns.com/",
//                 likes: 7,
//                 __v: 0
//               },
//               {
//                 _id: "5a422aa71b54a676234d17f8",
//                 title: "Go To Statement Considered Harmful",
//                 author: "Edsger W. Dijkstra",
//                 url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
//                 likes: 5,
//                 __v: 0
//               },
//               {
//                 _id: "5a422b3a1b54a676234d17f9",
//                 title: "Canonical string reduction",
//                 author: "Edsger W. Dijkstra",
//                 url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
//                 likes: 12,
//                 __v: 0
//               },
//               {
//                 _id: "5a422b891b54a676234d17fa",
//                 title: "First class tests",
//                 author: "Robert C. Martin",
//                 url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
//                 likes: 10,
//                 __v: 0
//               },
//               {
//                 _id: "5a422ba71b54a676234d17fb",
//                 title: "TDD harms architecture",
//                 author: "Robert C. Martin",
//                 url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
//                 likes: 0,
//                 __v: 0
//               },
//               {
//                 _id: "5a422bc61b54a676234d17fc",
//                 title: "Type wars",
//                 author: "Robert C. Martin",
//                 url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
//                 likes: 2,
//                 __v: 0
//               }  
//             ]
//         const result = listHelper.totalLikes(blogs)
//         assert.strictEqual(result, 36)
      
//       }
// })

// describe('dummy', () => {
//     test('dummy returns one', () => {
//         const blogs = []
      
//         const result = listHelper.dummy(blogs)
//         assert.strictEqual(result, 1)
//       })
// })