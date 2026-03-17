require('dotenv').config()
const express = require('express')
const {connectionToDB} = require("./db")
const Character = require('./models/characterModel')

const app = express()
const port = process.env.PORT

connectionToDB()


app.get('/', async (req, res) => {

try {
    const newCharacter = await Character.create({name:"Mario", description:"Un plombier"})
  res.send('Hello World!')

} catch (error) {
  console.log(error);

  res.json({message:error.errors[0].message, error :true})

}
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


/*
  Character.create({name:"Mario", description:"Un plombier"})

  Trouver avec une Primary Key (dans character : id)
  const project = await Project.findByPk(123);


  Trouver un élement avec une requête sur un attribut
  const project = await Project.findOne({ where: { title: 'My Title' } });
  if (project === null) {
      console.log('Not found!');
    } else {
      console.log(project instanceof Project); // true
      console.log(project.title); // 'My Title'
  }


  Le update :

  // Change everyone without a last name to "Doe"
    await User.update(
      { lastName: 'Doe' },
      {
        where: {
          lastName: null,
        },
      },
    );

  On va faire un router : charactersRouter
  POST /characters
  GET /characters
  GET /characters/:id
  PATCH /characters/:id
  DELETE /characters

  On va faire un controller : charactersController
  class CharacterController ou fonctions simples
  createOneCharacter
  getAllCharacter
  getOneCharacterById
  getOneCharacterByName
  updateOneCharacterById
  deleteOneCharacterById
*/
