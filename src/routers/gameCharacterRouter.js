const express = require('express');
const { addCharacterToGame } = require('../controllers/gameCharacterController');

const gameCharacterRouter = express.Router();

gameCharacterRouter.post('/game/:id/character', addCharacterToGame);

module.exports = gameCharacterRouter;
