const Game = require('../models/gameModel');
const Character = require('../models/characterModel');

const createOneGame = async (request, response) => {
  // Vérifier les données + logique métier
  const { title, releaseYear, platform, description } = request.body;

  if (!title || !releaseYear || !platform || !description) {
    response.status(400).json({
      message: 'Il vous faut fournir title, releaseYear, platform, description',
      error: true,
    });
  }

  //vérifier si un jeu avec le même nom existe.

  // Tenter de créer l'element
  try {
    const newGame = await Game.create({
      title,
      releaseYear,
      platform,
      description,
    });

    // Envoyer un feedback au client.
    response.status(201).json({
      message: 'Le jeu a bien été crée!',
      result: newGame,
    });
  } catch (error) {
    response.status(500).json({
      message: 'Impossible de créer le jeu en base',
      error: true,
    });
  }
};
const getAllGames = async (request, response) => {
  try {
    const games = await Game.findAll();

    response.json({ message: 'VOici les jeux', results: games });
  } catch (error) {
    response.status(500).json({
      message: 'Impossible de récupérer les jeux',
      error: true,
    });
  }
};
const getOneGameById = async (request, response) => {
  const id = request.params.id;
  console.log(request.query);

  const allCharacters = request.query.allCharacters;
  // Verif si c'est un nombre ou non, etc.

  try {
    const options = allCharacters ? { include: Character } : {};
    const game = await Game.findByPk(id, options);

    if (!game) {
      response.status(404).json({
        message: "Le jeu avec cet ID n'existe pas",
        error: true,
      });
    }

    response.json({ message: 'Voici votre jeu', result: game });
  } catch (error) {
    response.status(500).json({
      message: 'Erreur serveur',
      error: true,
    });
  }
};
const updateOneGameById = async (request, response) => {
  if (!request.body || request.body.length === 0) {
    return response.status(400).json({
      message: 'Merci de fournir des données de jeu ',
      error: true,
    });
  }
  const { title, releaseYear, platform, description } = request.body;
  const id = request.params.id;
  //      PATCH /games/:id

  const updates = {};

  if (title) {
    updates.title = title;
  }

  if (releaseYear) {
    updates.releaseYear = releaseYear;
  }

  if (platform) {
    updates.platform = platform;
  }

  if (description) {
    updates.description = description;
  }

  const keysOfUpdates = Object.keys(updates);

  if (keysOfUpdates.length === 0) {
    response.status(400).json({
      message: 'Merci de fournir des données de jeu valable',
      error: true,
    });
  }

  try {
    const game = await Game.findByPk(id);

    if (!game) {
      response.status(404).json({
        message: "Le jeu avec cet ID n'existe pas",
        error: true,
      });
    }

    for (const key in updates) {
      game[key] = updates[key];
    }

    await game.save();

    response.json({ message: 'Le jeu a été modifié', result: game });
  } catch (error) {
    response.status(500).json({
      message: 'Erreur serveur',
      error: true,
    });
  }
};
const deleteOneGameById = async (request, response) => {
  const id = Number(request.params.id);

  if (!id || isNaN(id)) {
    return response
      .status(400)
      .json({ message: "L'id doit être de type numérique", error: true });
  }

  try {
    const game = await Game.findByPk(id);

    if (!game) {
      return response.status(404).json({
        message: "Il n'y a pas de jeu avec cet ID",
        error: true,
      });
    }

    const isDestroyed = await game.destroy();
    response.json({ message: 'Jeu supprimé', result: isDestroyed });
  } catch (error) {
    response.status(500).json({ message: 'Erreur du server', error: true });
  }
};

module.exports = {
  createOneGame,
  getAllGames,
  getOneGameById,
  updateOneGameById,
  deleteOneGameById,
};
