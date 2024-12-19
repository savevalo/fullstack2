import Persons from './components/Persons'
import Filter from './components/Filter'
import Notification from './components/Notification'
import { useState, useEffect } from 'react'
import './index.css'
// import axios from 'axios'
import personService from './services/persons'


const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [newFilter, setNewFilter] = useState('')
  const [peopleToShow, setPeopleToShow] = useState(persons)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    personService
      .getAll()
      .then(response => {
        setPersons(response.data)
        setPeopleToShow(response.data)
      })
  }, [])

  const removePerson = id => {
    const person = persons.find(person => person.id === id);
  
    if (window.confirm(`do you want to delete ${person.name}?`)) {
      personService
        .deletePerson(id)
        .then(() => {
          const newPersons = persons.filter(person => person.id !== id);
          const deleted = persons.filter(person => person.id == id)
          setPersons(newPersons);
          setPeopleToShow(newPersons);
          
          setErrorMessage(
            `Deleted: ${deleted[0].name}`
          )
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
        })
        .catch(error => {
          alert(`The person '${person.name}' was already deleted from the server.`);
          setPersons(persons.filter(person => person.id !== id));
          setPeopleToShow(peopleToShow.filter(person => person.id !== id));
        });
    }
  }

  const updatePhoneNumber = (id, nameObject) => {
    personService
      .update(id, nameObject)
      .then((response) => {
        console.log(response)
        setPersons(persons.map((person) => (person.id !== id ? person : response.data)));
        setPeopleToShow(persons.map((person) => (person.id !== id ? person : response.data)));
        setNewName('');
        setNewNumber('');
        setErrorMessage(
          `Added ${response.data.name}`
        )
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      })

  }

  const addName = (event) => {
    event.preventDefault()
    console.log(event)
    console.log(event.target[0].value)

    const nameObject = {
      name: newName,
      number: newNumber
    }

    for (let i = 0; i < persons.length; i++) {
      if (event.target[0].value == persons[i].name) {
        //alert(`${event.target[0].value} is already added to phonebook`)
        if (window.confirm(`${event.target[0].value} has already been added to phonebook, replace the old number with a new one?`)) {
          console.log(persons[i].id)
          updatePhoneNumber(persons[i].id, nameObject)
          
          return
        }
        
      }
    }

    personService
      .create(nameObject)
      .then(response => {
        setPersons(persons.concat(response.data))
        setPeopleToShow(persons.concat(response.data))
        setNewName('')
        setNewNumber('')
        setErrorMessage(
          `Added ${response.data.name}`
        )
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
    })



  }

  const handleNameChange = (event) => {
    console.log(event.target.value)
    setNewName(event.target.value)
    console.log(newName)
  }

  const handleNumberChange = (event) => {
    console.log(event.target.value)
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    const uusi = event.target.value
    console.log(uusi)
    setNewFilter(uusi)
  
    if (uusi === "") {
      setPeopleToShow(persons);
      return;
    }
  
    setPeopleToShow(persons.filter((person) =>
      person.name.toLowerCase().includes(uusi.toLowerCase())
    ))
    console.log(peopleToShow);

  }


  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={errorMessage} />
      <Filter newFilter={newFilter} handleFilterChange={handleFilterChange} />
      <h2>add a new</h2>
      <form onSubmit={addName}>
        <div>
          name: <input 
          value={newName}
          onChange={handleNameChange}
          />
        </div>
        <div>
          number: <input 
          value={newNumber}
          onChange={handleNumberChange}
          />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
      <h2>Numbers</h2>
      <Persons persons={peopleToShow}
      removePerson={removePerson}
      />
    </div>
  )
}



export default App