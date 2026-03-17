const express = require("express");
const { createOneCharacter, getAllCharacter, getOneCharacterById, updateOneCharacterById, deleteOneCharacterById } = require("../controllers/characterController");

const charactersRouter = express.Router();

charactersRouter.post("/", createOneCharacter)

charactersRouter.get("/", getAllCharacter)

charactersRouter.get("/:id", getOneCharacterById)

charactersRouter.patch("/:id", updateOneCharacterById)

charactersRouter.delete("/:id", deleteOneCharacterById)

module.exports = charactersRouter;
