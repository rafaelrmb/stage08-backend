const { hash, compare } = require('bcrypt');
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
      console.error(error)
      res.status(500).json({ error: 'Unable to create user' });
    }
  }

  async update(req, res) {
    const user_id = req.user.id;
    const { name, email, password, old_password, updated_at } = req.body;

    //selects the user based on the id provided in the params
    const user = await knex('users').where({ id: user_id }).first();

    //checks if the user is in the database
    if (!user) {
      return res.status(400).json({ error: 'User not registered' });
    }

    //checks if the new email is already registered
    const isEmailRegistered = await knex('users').where({ email }).first();
    if (isEmailRegistered && isEmailRegistered.id !== Number(user_id)) {
      return res.status(500).json({ error: 'Email is already taken. Try a different one.' });
    }

    //assign the updated name or email to the user
    user.name = name;
    user.email = email;

    //updates the time user was updated with brazil's time zone
    const brTimeZoneUpdatedAt = moment.tz(updated_at, 'America/Sao_Paulo').format();


    //check if user has updated password
    if (!password && !old_password) {
      user.password = user.password;
    } else if (password && !old_password) {
      return res.status(500).json({ error: 'Please provide your last password to update it.' });
    } else {
      //check if current password matches before updating
      const isPasswordCorrect = await compare(old_password, user.password);

      if (!isPasswordCorrect) {
        return res.status(500).json({ error: 'The password does not match your current password.' });
      }
      //updates password
      user.password = await hash(password, 10);
    }

    //updates the user
    try {
      await knex('users').where({ id: user_id }).update({
        name: user.name,
        email: user.email,
        updated_at: brTimeZoneUpdatedAt,
        password: user.password
      });
      res.status(200).json({ name, email });
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Unable to update user' });
    }
  }
};


module.exports = UsersController;