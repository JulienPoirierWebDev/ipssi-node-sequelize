const isAdmin = (req, res, next) => {
  if (req.user.role === 'admin') {
    next();
  } else {
    res.json({ message: "Vous n'êtes pas administrateur", error: true });
  }
};

module.exports = isAdmin;
