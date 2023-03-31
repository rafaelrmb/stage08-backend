const knex = require('../database/knex');


class TagsController {
  async index(req, res) {
    const user_id = req.user.id;

    const tags = await knex('tags').where({ user_id });

    if (tags.length === 0) {
      return res.status(404).json({ message: 'No tags were found for this user' });
    }

    return res.status(200).json(tags);
  }
}

module.exports = TagsController;