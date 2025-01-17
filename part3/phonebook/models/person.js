import mongoose from "mongoose"

const url = process.env.MONGODB_URI;
// const password = process.argv[2]
console.log('connecting to', url)

// const url = 
// `mongodb+srv://savevalo:${password}@cluster0.zxld0.mongodb.net/personsApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)
mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})


personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

export default mongoose.model('Person', personSchema)
