import { useState } from 'react'
// import blogService from '../services/blogs'


const Blog = ({ blog, handleLike, handleDelete, user }) => {

  const [ visible, setVisible ] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const isOwner = user && blog.user && user.username === blog.user.username
  // const hideWhenVisible = { display: visible ? 'none' : '' }
  // const showWhenVisible = { display: visible ? '' : 'none' }


  return (

    <div style={blogStyle}>
      <div /*style={hideWhenVisible}*/>
        <span>{blog.title}</span> <span>{blog.author}</span>
        <button style={{ marginLeft: '5px' }} onClick={toggleVisibility}>
          {visible ? 'hide' : 'show'}
        </button>
      </div>
      {visible &&
      <div /*style={showWhenVisible}*/>
        {/* <div>{blog.title} {blog.author}</div> */}
        <div>{blog.url}</div>
        <label><div>likes: {blog.likes} <button onClick={() => handleLike(blog)}>like</button></div></label>
        <div>{blog.user.name}</div>
        {isOwner && (
          <button onClick={() => handleDelete(blog)}>delete</button>
        )}
      </div>}
    </div>
  )}

export default Blog