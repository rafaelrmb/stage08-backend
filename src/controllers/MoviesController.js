const knex = require('../database/knex');
var moment = require('moment-timezone');

class MoviesController {
  async create(req, res) {
    const { title, description, rating, created_at, updated_at, tags } = req.body;
    const { user_id } = req.params;
    let movieId;

    //checks if the user has already registered the movie
    const isMovieRegistered = await knex('movies').where({ title, user_id }).first();
    if (isMovieRegistered) {
      return res.status(409).json({ message: 'Movie already registered for this user' });
    }

    //makes sure the maximum rate is 5 and the minimum rate is 1
    let allowedRating;
    rating > 5 ? allowedRating = 5 : rating < 1 ? allowedRating = 1 : allowedRating = rating;

    //convert the dates to brazil's timezone
    const brTimeZoneCreatedAt = moment.tz(created_at, 'America/Sao_Paulo').format();
    const brTimeZoneUpdatedAt = moment.tz(updated_at, 'America/Sao_Paulo').format();

    //insert the new movie into the database
    try {
      const [movie_id] = await knex('movies').insert({
        title,
        description,
        rating: allowedRating,
        created_at: brTimeZoneCreatedAt,
        updated_at: brTimeZoneUpdatedAt,
        user_id
      });
      movieId = movie_id;
      res.status(200).json({ title, description, rating, brTimeZoneCreatedAt, brTimeZoneUpdatedAt });
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Unable to create movie' });
    }

    //inputs the tags in the database
    const tagsInsert = tags.map(name => {
      return {
        name,
        movie_id: movieId,
        user_id
      }
    });

    try {
      await knex('tags').insert(tagsInsert);
    } catch (error) {
      res.status(500).json({ error: 'Unable to create tags' });
    }
  }
}

module.exports = MoviesController;