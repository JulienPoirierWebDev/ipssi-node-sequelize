

/*
  createOneCharacter
  getAllCharacter
  getOneCharacterById
  updateOneCharacterById
  deleteOneCharacterById
*/

const Character = require("../models/characterModel");

// Si la logique métier était complexe : nous aurions une couche service.
// Si la couche donnée était complexe (sans ORM), nous pourrions avoir besoin d'un repository. Mais là, ce n'est pas le cas, car Sequelize simplifie le process

// Scénario de l'endpoin
// -> Création et tout va bien

const createOneCharacter = async (request, response) => {

  const {name, description} = request.body;

  // vérification de la présence et des types
  if(!name || !description || typeof name !== "string" || typeof description !== "string") {
    return response.status(400).json({message:"Le corps de la requête doit contenir name et description, en string", error:true})
  }

  // Try catch si jamais il y a une erreur, pour ne pas casser l'application
  try {
    const newCharacter = await Character.create({name:name,description:description})

    response.status(201).json({message:"Le personnage a été creé", character:newCharacter})

  } catch (error) {
    response.status(500).json({message: "Le personnage n'a pas pu être crée a cause du serveur", error:true})

  }

}


const getAllCharacter = async (request, response) => {

  try {
      const characters = await Character.findAll();

      response.json({message:"Personnages trouvés", results:characters})
  } catch (error) {
      response.status(500).json({message:"Erreur du server", error:true})

  }
}

const getOneCharacterById  = async (request, response) => {
  const id = Number(request.params.id);

  if(!id || isNaN(id)) {
        return response.status(400).json({message:"L'id doit être de type numérique", error:true})
  }


  try {
    const character = await Character.findByPk(id)

    if(!character) {
      return response.status(404).json({message: "Il n'y a pas de personnage avec cet ID", error:true})
    }

    response.json({message:"Personnage trouvé", result:character})
  } catch (error) {
    response.status(500).json({message:"Erreur du server", error:true})
  }
}

const updateOneCharacterById = async (request, response) => {

    const id = Number(request.params.id);

    if(!id || isNaN(id)) {
          return response.status(400).json({message:"L'id doit être de type numérique", error:true})
    }

    const {description} = request.body;
    try {
      const character = await Character.findByPk(id)

      if(!character) {
        return response.status(404).json({message: "Il n'y a pas de personnage avec cet ID", error:true})
      }

      character.description = description;
      character.updatedAt = Date.now()
      character.save();
      response.status(201).json({message:"Personnage modifié avec succès", result: character})
      } catch (error) {
        console.log(error)
        response.status(500).json({message:"Erreur du server", error:true})
      }
}

const deleteOneCharacterById = async (request, response) => {
 const id = Number(request.params.id);

  if(!id || isNaN(id)) {
        return response.status(400).json({message:"L'id doit être de type numérique", error:true})
  }


  try {
    const character = await Character.findByPk(id)

    if(!character) {
      return response.status(404).json({message: "Il n'y a pas de personnage avec cet ID", error:true})
    }

    const isDestroyed = await character.destroy()
    response.json({message:"Personnage supprimé", result:isDestroyed})
  } catch (error) {
    response.status(500).json({message:"Erreur du server", error:true})
  }
}

module.exports = {createOneCharacter, getAllCharacter, getOneCharacterById, updateOneCharacterById, deleteOneCharacterById}
