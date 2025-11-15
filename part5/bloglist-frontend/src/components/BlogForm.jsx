import { useState } from 'react'


const BlogForm = ({ createBlog }) => {
  const [newBlog, setNewBlog] = useState({
    title: '',
    author: '',
    url: ''
  })

  const addBlog = (event) => {
    event.preventDefault()
    createBlog({
      title: newBlog.title,
      author: newBlog.author,
      url: newBlog.url,
      likes: 0
    })

    setNewBlog({
      title: '',
      author: '',
      url: ''
    })
  }

  const handleBlogChange = (event) => {
    const { name, value } = event.target
    setNewBlog({
      ...newBlog,
      [name]: value
    })
  }

  return (
    <form onSubmit={addBlog}>
      <label>
        <div>
          title:<input className="titleInput" name="title" value={newBlog.title} onChange={handleBlogChange} />
        </div>
      </label>
      <label>
        <div>
          author:<input className="authorInput" name="author" value={newBlog.author} onChange={handleBlogChange} />
        </div>
      </label>
      <label>
        <div>
          url:<input className="urlInput" name="url" value={newBlog.url} onChange={handleBlogChange} />
        </div>
      </label>
      <button type="submit">create</button>
    </form>)
}

export default BlogForm