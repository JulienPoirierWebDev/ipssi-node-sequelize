// Ce controller gère les relations entre les models Game et Character

const Character = require('../models/characterModel');
const Game = require('../models/gameModel');

const addCharacterToGame = async (req, res) => {
  // ajout d'un perso -> perso existe déja (on doit connaitre son id)
  // a un jeu -> jeu existe déja (on doit connaitre son id)

  // CRUD --> faire des associations / des relations.

  //  POST  /games/:id/character/

  const gameId = req.params.id;
  // vérifier le type de l'ID

  const characterId = req.body.characterId;
  if (!characterId || isNaN(Number(characterId))) {
    return res.stats(400).json({
      message: 'Merci de fournir un id de perso valable',
    });
  }
  console.log(gameId, characterId);

  try {
    const game = await Game.findByPk(gameId);
    const character = await Character.findByPk(characterId);

    console.log(game, character);
    if (!game || !character) {
      return res
        .status(404)
        .json({ message: "Le jeu ou le perso n'existe pas", error: true });
    }

    await game.setCharacters([character]);

    res.json({
      message: 'Perso ajouté au jeu',
    });
  } catch (error) {
    res.status(500).json({ message: 'erreur serveur', error: error });
  }
};

module.exports = { addCharacterToGame };
