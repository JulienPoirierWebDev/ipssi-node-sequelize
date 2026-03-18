const express = require("express");
const { createOneCharacter, getAllCharacter, getOneCharacterById, updateOneCharacterById, deleteOneCharacterById } = require("../controllers/characterController");

const characterRouter = express.Router();

characterRouter.post("/", createOneCharacter)

characterRouter.get("/", getAllCharacter)

characterRouter.get("/:id", getOneCharacterById)

characterRouter.patch("/:id", updateOneCharacterById)

characterRouter.delete("/:id", deleteOneCharacterById)

module.exports = characterRouter;
