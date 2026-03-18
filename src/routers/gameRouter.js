const express = require('express');
const { createOneGame, getAllGames, getOneGameById, updateOneGameById, deleteOneGameById } = require('../controllers/gameController');

const gameRouter = express.Router();

gameRouter.post('/', createOneGame);

gameRouter.get('/', getAllGames);

gameRouter.get('/:id', getOneGameById);

gameRouter.patch('/:id', updateOneGameById);

gameRouter.delete('/:id', deleteOneGameById);

module.exports = gameRouter;
