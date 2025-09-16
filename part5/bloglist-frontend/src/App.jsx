import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'


const App = () => {
  const [blogs, setBlogs] = useState([])
  const [newBlog, setNewBlog] = useState({
    title: '',
    author: '',
    url: ''
  })
  const [username, setUsername] = useState('') 
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)


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

  const addBlog = event => {
    event.preventDefault()
    const blogObject = {
      title: newBlog.title,
      author: newBlog.author,
      url: newBlog.url,
      likes: 0
    }

    blogService.create(blogObject).then(returnedBlog => {
      setBlogs(blogs.concat(returnedBlog))
      setNewBlog({
        title: '',
        author: '',
        url: ''
      })
      setSuccessMessage(`a new blog ${returnedBlog.title} by ${returnedBlog.author} added!`)
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
    })
  }

const handleBlogChange = (event) => {
  const { name, value } = event.target
  setNewBlog({
    ...newBlog,
    [name]: value
  })
}


  if (user === null) {
    return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <Notification message={errorMessage} />
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
      <form onSubmit={addBlog}>
        <div>
          title:<input name="title" value={newBlog.title} onChange={handleBlogChange} />
        </div>
        <div>
          author:<input name="author" value={newBlog.author} onChange={handleBlogChange} />
        </div>
        <div>
          url:<input name="url" value={newBlog.url} onChange={handleBlogChange} />
        </div>
      <button type="submit">create</button>
    </form>
      {blogs.map(blog =>
        <Blog key={blog.id} blog={blog} />
      )}
    </div>
  )
}

export default App