import Person from './Person'


const Persons = ({persons, removePerson}) => {
    return (
    <ul>
    {persons.map(person =>
        <Person key={person.id} 
        person={person}
        removePerson={() => removePerson(person.id)}
        />
    )}
    </ul>
    )
}




export default Persons