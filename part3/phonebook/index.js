const express = require('express')
const morgan = require('morgan')
const cors = require('cors')


const app = express()

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
// app.use(morgan('tiny'))
morgan.token('person', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'));


let persons = [
    { 
        "id": "1",
        "name": "Arto Hellas", 
        "number": "040-123456"
      },
      { 
        "id": "2",
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
      },
      { 
        "id": "3",
        "name": "Dan Abramov", 
        "number": "12-43-234345"
      },
      { 
        "id": "4",
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
      }
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
    let currentTime = new Date()
    const info = `<p>Phonebook has info for ${persons.length} people</p><p>${currentTime}</p>`
    response.send(info)
})

app.get('/api/persons/:id', (request, response) => {
    
    const id = request.params.id
    const person = persons.find(p => p.id === id)
    
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
})

const generateId = () => {
    return Math.floor(Math.random() * 10000000001);
  }
  
  app.post('/api/persons', (request, response) => {
    console.log(request.headers)
    const body = request.body
  
    if (!body.name) {
      return response.status(400).json({ 
        error: 'name missing' 
      })
    }

    if (!body.number) {
        return response.status(400).json({ 
          error: 'number missing' 
        })
      }

    const ifexist = persons.find(person => person.name === body.name)
    if (ifexist) {
        return response.status(400).json({ 
        error:  `person already exists with name: ${body.name}` 
          })
    }
  
    const person = {
      name: body.name,
      number: body.number,
      id: generateId(),
    }
  
    persons = persons.concat(person)
  
    response.json(person)
})
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})