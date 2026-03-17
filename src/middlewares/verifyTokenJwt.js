const jwt = require('jsonwebtoken');

const verifyTokenJwt = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    console.log(token);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    res.status(403).json({
      message: "Vous n'avez pas le droit d'être sur cette route protégée",
      error: true,
    });
  }
};

module.exports = verifyTokenJwt;
