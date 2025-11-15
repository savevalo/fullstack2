import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'
import blogService from './services/blogs'
import loginService from './services/login'


const App = () => {
  // const [newBlog, setNewBlog] = useState({
  //   title: '',
  //   author: '',
  //   url: ''
  // })
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const handleLike = async (blogToLike) => {
    const updatedBlog = {
      ...blogToLike,
      likes: blogToLike.likes + 1,
      user: blogToLike.user.id || blogToLike.user
    }

    const returnedBlog = await blogService.update(blogToLike.id, updatedBlog)

    setBlogs(prevBlogs =>
      prevBlogs
        .map(b => b.id === returnedBlog.id ? returnedBlog : b)
        .sort((a, b) => b.likes - a.likes)
    )
  }

  const handleDelete = async (blogTodelete) => {
    const confirm = window.confirm(`remove blog ${blogTodelete.title} by ${blogTodelete.author}`)
    if (confirm) {
      try {
        blogService.remove(blogTodelete.id)
        setBlogs(blogs.filter(blog => blog.id !== blogTodelete.id))
        setSuccessMessage(`a blog ${blogTodelete.title} by ${blogTodelete.author} deleted`)
        setTimeout(() => {
          setSuccessMessage(null)
        }, 5000)
      } catch (error) {
        console.log(error.message)
      }

    }
  }

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])


  const handleLogin = async event => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch {
      setErrorMessage('wrong username or password')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )
  }, [])

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
  }

  const addBlog = (blogObject) => {
    blogService
      .create(blogObject)
      .then(returnedBlog => {
        setBlogs(blogs.concat(returnedBlog))
        setSuccessMessage(`a new blog ${returnedBlog.title} by ${returnedBlog.author} added!`)
        setTimeout(() => {
          setSuccessMessage(null)
        }, 5000)
      })
  }

  // const handleBlogChange = (event) => {
  //   const { name, value } = event.target
  //   setNewBlog({
  //     ...newBlog,
  //     [name]: value
  //   })
  // }

  const blogForm = () => (
    <Togglable buttonLabel="create new blog">
      <BlogForm
      // handleBlogChange={handleBlogChange}
      // newBlog={newBlog}
      // addBlog={addBlog}
        createBlog={addBlog}
      />
    </Togglable>
  )

  if (user === null) {
    return (
      <div>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <Notification message={errorMessage} type="error"/>
            <label>
            username
              <input
                type="text"
                value={username}
                onChange={({ target }) => setUsername(target.value)}
              />
            </label>
          </div>
          <div>
            <label>
            password
              <input
                type="password"
                value={password}
                onChange={({ target }) => setPassword(target.value)}
              />
            </label>
          </div>
          <button type="submit">login</button>
        </form>

      </div>
    )
  }


  return (
    <div>
      <h2>blogs</h2>
      <p>{user.name} is logged in <button type="button" onClick={handleLogout}>logout</button></p>
      <Notification message={successMessage} type="success" />
      {blogForm()}
      {[...blogs].sort((a, b) => b.likes - a.likes).map(blog =>
        <div className="blog" key={blog.id}>
          <Blog
            blog={blog}
            handleLike={handleLike}
            handleDelete={handleDelete}
            user={user}
          />
        </div>
      )}
    </div>
  )
}

export default App