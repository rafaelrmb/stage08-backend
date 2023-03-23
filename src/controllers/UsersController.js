const { hash } = require("bcrypt");
const knex = require('../database/knex');
var moment = require('moment-timezone');

class UsersController {
  async create(req, res) {
    const { name, email, password, created_at, updated_at } = req.body;

    // check if the email is already registered in the database
    const existingUser = await knex('users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    //hashes the password from encryption
    const hashedPassword = await hash(password, 10);

    //format the timezone of created_at and updated_at rows.
    const brTimeZoneCreatedAt = moment.tz(created_at, 'America/Sao_Paulo').format();
    const brTimeZoneUpdatedAt = moment.tz(updated_at, 'America/Sao_Paulo').format();

    // insert the new user into the database
    try {
      await knex('users').insert({
        name,
        email,
        password: hashedPassword,
        created_at: brTimeZoneCreatedAt,
        updated_at: brTimeZoneUpdatedAt
      });
      res.status(201).json({ name, email, hashedPassword, brTimeZoneCreatedAt, brTimeZoneUpdatedAt });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Unable to create user' });
    }
  }
};


module.exports = UsersController;