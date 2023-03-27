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

  async show(req, res) {
    const { user_id, id } = req.params;

    //collect the movie with specific id for a specific user
    const movie = await knex('movies').where({ id, user_id }).first();

    //collect all the tags for the movie with specific id for a specific user
    const tags = await knex('tags').where({ movie_id: id, user_id });

    //return only the names of the tags in the db
    const tagsNames = tags.map(tag => tag.name);

    //if the movie is not found return a 404 error
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    //return the movie
    res.status(200).json({
      title: movie.title,
      description: movie.description,
      rating: movie.rating,
      tags: tagsNames
    });
  }

  async index(req, res) {
    const { user_id, title, tags } = req.query;
    let query = knex('movies').where({ user_id });

    //if the user has provided a title
    if (title) {
      query = query.where('title', 'like', `%${title}%`).orderBy('title');
    }

    //if tags are provided
    if (tags) {
      const tagsArr = tags.split(',').map(tag => tag.trim());

      query = knex('tags')
        .select([
          'movies.title',
          'movies.description',
          'movies.rating',
          'movies.user_id',
          'movies.id'
        ])
        .where('movies.user_id', user_id)
        .whereIn('name', tagsArr)
        .innerJoin('movies', 'movies.id', 'tags.movie_id')
        .orderBy('created_at', 'desc');

      if (title) {
        query = query.where('title', 'like', `%${title}%`);
      }
    }

    const movies = await query;

    const userTags = await knex('tags').where({ user_id });
    const moviesWithTags = movies.map(movie => {
      const movieTags = userTags.filter(tag => tag.movie_id === movie.id);
      const tagsNames = movieTags.map(tag => tag.name);

      return {
        ...movie,
        tags: tagsNames
      };
    });

    //if the user has not registered any movies return a 404 error
    if (movies.length === 0) {
      return res.status(404).json({ message: 'No movies found' });
    }

    //return the movies list formatted with title description and rating only
    const moviesList = moviesWithTags.map(movie => {
      return {
        title: movie.title,
        description: movie.description,
        rating: movie.rating,
        tags: movie.tags
      }
    });

    return res.status(200).json(moviesList);
  }

  async delete(req, res) {
    const { user_id, id } = req.params;

    const isDeleted = await knex('movies').where({ id, user_id }).delete();

    return isDeleted ? res.status(200).json({ message: 'Movie deleted' }) : res.status(404).json({ message: 'Movie not found' });
  }

  async update(req, res) {
    const { user_id, id } = req.params;
    const { updated_at, description, title } = req.body;

    const movie = await knex('movies').where({ user_id, id }).first();

    if (!movie) {
      return res.status(404).json({ message: "The movie was not registered by this user." });
    }

    const isMovieRegistered = await knex('movies').where({ user_id, title }).first();

    if (isMovieRegistered && movie.title !== title) {
      return res.status(500).json({ message: 'User has already registered a movie with this title.' });
    }

    const brTimeZoneUpdatedAt = moment.tz(updated_at, 'America/Sao_Paulo').format();

    movie.description = description;
    movie.title = title;

    try {
      await knex('movies').where({ user_id, id }).update({
        title: movie.title,
        description: movie.description,
        created_at: brTimeZoneUpdatedAt
      });
    } catch (error) {
      return res.status(500).json({ message: 'Could not update the movie info.' });
    }

    return res.status(200).json(movie);
  }
}

module.exports = MoviesController;