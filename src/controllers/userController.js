const bcrypt = require('bcrypt');
const User = require('../models/userModel');

const register = async (request, response) => {
  const { email, password, username } = request.body;

  const salt = Number(process.env.SALT);

  try {
    const hashed = await bcrypt.hash(password, salt);

    const userExist = await User.findOne({ email });
    if (userExist) {
      return response
        .status(400)
        .json({ message: 'Adresse email déja utilisée', error: true });
    }

    const newUser = await User.create({
      email,
      passwordHash: hashed,
      username,
    });

    response
      .status(201)
      .json({ message: `L'utilisateur ${newUser.username} a été crée` });
  } catch (error) {
    response
      .status(500)
      .json({ message: "Nous n'avons pas pu vous inscrire", error: true });
  }
};

const deleteUser = (request, response) => {};

const signin = async (request, response) => {
  const { email, password } = request.body;

  try {
    const userExist = await User.findOne({ email });

    if (!userExist) {
      return response.json({
        message: "Il y a un problème avec l'email / le password",
        error: true,
      });
    }

    const isAuthenticated = await bcrypt.compare(
      password,
      userExist.passwordHash,
    );

    if (isAuthenticated) {
      response.json({ message: "Mais c'est vous !" });
    } else {
      response.json({
        message: "Il y a un problème avec l'email / le password",
        error: true,
      });
    }
  } catch (error) {
    response
      .status(500)
      .json({ message: "Nous n'avons pas pu vous connecter", error: true });
  }
};

module.exports = { register, deleteUser, signin };
