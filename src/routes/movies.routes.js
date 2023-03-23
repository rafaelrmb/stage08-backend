const { Router } = require("express");
const MoviesController = require("../controllers/MoviesController");
const moviesController = new MoviesController();
const moviesRoutes = Router();


moviesRoutes.post("/:user_id", moviesController.create);

module.exports = moviesRoutes;