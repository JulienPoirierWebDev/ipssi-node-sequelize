require('dotenv').config();
const express = require('express');
const { connectionToDB } = require('./db');
const charactersRouter = require('./routers/characterRouter');
const userRouter = require('./routers/userRouter');

const verifyTokenJwt = require('./middlewares/verifyTokenJwt');
const isAdmin = require('./middlewares/isAdmin');
const cookieParser = require('cookie-parser');
const gameRouter = require('./routers/gameRouter');
const gameCharacterRouter = require('./routers/gameCharacterRouter');

const app = express();
// Pouvoir lire les body des requêtes en JSON
app.use(express.json());
// Accepter les formulaires HTML
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

const port = process.env.PORT;

connectionToDB();

// middleware 1 -> middleware2 -> middleware 3 -> controller
app.use((req, res, next) => {
  console.log('je suis un middleware');

  console.log(req.cookies);
  next();
});

app.use(
  '/characters',
  (req, res, next) => {
    console.log('Je suis un middleware de router');
    next();
  },
  charactersRouter,
);
app.use('/users', userRouter);
app.use('/games', gameRouter);
app.use('/', gameCharacterRouter);

app.get(
  '/',
  (req, res, next) => {
    console.log('Je suis un middleware de route racine');
    next();
  },
  async (req, res) => {
    res.send('Hello World!');
  },
);

app.get('/protected', verifyTokenJwt, isAdmin, (req, res) => {
  console.log('Aije quelque chose ? ', req.user);
  res.json({ message: 'Je suis protégé, non ?' });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

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
