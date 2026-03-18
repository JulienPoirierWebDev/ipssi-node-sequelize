'use strict';

const charactersToCreate = [
  {
    name: 'Mario',
    description: 'Un plombier courageux du Royaume Champignon',
  },
  {
    name: 'Luigi',
    description: 'Le frere de Mario, plus discret mais tout aussi brave',
  },
  {
    name: 'Peach',
    description: 'La princesse du Royaume Champignon',
  },
  {
    name: 'Bowser',
    description: 'Le roi des Koopas et ennemi principal de Mario',
  },
];

module.exports = {
  async up(queryInterface) {
    const characters = [];

    for (const character of charactersToCreate) {
      characters.push({
        ...character,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert('Characters', characters, {});
  },

  async down(queryInterface) {
    const names = [];

    for (const character of charactersToCreate) {
      names.push(character.name);
    }

    await queryInterface.bulkDelete(
      'Characters',
      {
        name: names,
      },
      {}
    );
  },
};
