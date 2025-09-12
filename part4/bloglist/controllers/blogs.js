// import Blog from '../models/blog.js'
const { response } = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
// const blogRouter = require('express').Router()
// import express from 'express'
const express = require('express')
const { usersInDb, blogsInDb } = require('../utils/list_helper')


const blogRouter = express.Router()

// blogRouter.get('/', (request, response) => {
//     Blog
//       .find({})
//       .then(blogs => {
//         response.json(blogs)
//       })
//   })

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})


blogRouter.post('/', async (request, response) => {
  // const blog = new Blog(request.body)
  const body = request.body

  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)

  if (!user) {
    return response.status(400).json({ error: 'userId missing or not valid' })
  }
  // const users = await usersInDb()
  
  // const userid = users[0].id
  // const user = await User.findById(userid)
  // console.log(user)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user.id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
  // blog
  //   .save()
  //   .then(result => {
  //     response.status(201).json(result)
  //     console.log(request.body)
  //   })
})

blogRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogRouter.put('/:id', async (request, response) => {

  const { likes } = request.body

  await Blog.findById(request.params.id)
    .then(blog => {
      if (!blog) {
        response.status(404).end()
      }
      blog.likes = likes

      blog.save().then((updatedBlog) => {
        response.json(updatedBlog)
      })
    })
    
})

// export default blogRouter
module.exports = blogRouter