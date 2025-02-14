// const express = require('express')
// const app = express()
// const cors = require('cors')
// const mongoose = require('mongoose')

import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

import Blog from './models/blog.js'

const app = express()

//const Blog = mongoose.model('Blog', blogSchema)
const url = process.env.MONGODB_URI;
//const mongoUrl = ''
mongoose.connect(url)

app.use(cors())
app.use(express.json())

app.get('/api/blogs', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

app.post('/api/blogs', (request, response) => {
  const blog = new Blog(request.body)

  blog
    .save()
    .then(result => {
      response.status(201).json(result)
      console.log(request.body)
    })
})

const PORT = 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
