const express = require('express');
const {
  register,
  deleteUser,
  signin,
  deleteCookie,
} = require('../controllers/userController');
// inscrire un utilisateur : Create -> Register

// Read -> Non ReadOne / ReadAll.

// Update -> Modification du mot de passe : Envoi d'un lien pour changer le mot de passe par email : clic (token) -> vérification : modification prise en compte.

// Delete -> Oui, mais que les ADMIN ! Sauf supprimer son propre compte (a voir.)

// Login : -> vérifier si l'utilisateur existe + si bon mot de passe. Si ok, on renvoi un token JWT. On pourra vérifier l'utilisateur grace au token.

const userRouter = express.Router();

userRouter.post('/register', register);

userRouter.get('/logout', deleteCookie);

//userRouter.patch('/:id', () => {});

userRouter.delete('/:id', deleteUser);

userRouter.post('/signin', signin);

module.exports = userRouter;
