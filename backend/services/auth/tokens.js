const jwt = require('jsonwebtoken');

function generateJWT(user) {
  const tokenData = { email: user.email, id: user.id };
  return jwt.sign({ user: tokenData }, process.env.JWT_SECRET);
}

function decodeToken(req) {
  const token = req.headers.authorization || req.headers['authorization'];

  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = { generateJWT, decodeToken };
