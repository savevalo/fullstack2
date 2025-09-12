// import app from './app.js'
const app = require('./app.js')


const PORT = 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
