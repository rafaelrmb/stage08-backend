const { verify } = require("jsonwebtoken");
const authConfig = require('../configs/auth');

function ensureAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No JWT Token found' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const { sub: user_id } = verify(token, authConfig, jwt.secret);

    req.user = {
      id: Number(user_id)
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid JWT Token' });
  }
}

module.exports = ensureAuth;