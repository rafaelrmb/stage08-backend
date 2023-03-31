const knex = require('../database/knex');
const { compare } = require('bcrypt');
const { sign } = require('jsonwebtoken');
const authConfig = require('../configs/auth');

class SessionsController {
  async create(req, res) {
    const { email, password } = req.body;

    const user = await knex('users').where({ email }).first();

    if (!user) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const isPasswordCorrect = await compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: String(user.id),
      expiresIn
    });

    return res.status(200).json({ user, token });
  }
}

module.exports = SessionsController;