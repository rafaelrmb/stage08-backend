const { Router } = require("express");
const MoviesController = require("../controllers/MoviesController");
const moviesController = new MoviesController();
const moviesRoutes = Router();


moviesRoutes.post("/:user_id", moviesController.create);
moviesRoutes.get("/:user_id/:id", moviesController.show);
moviesRoutes.get("/", moviesController.index);

module.exports = moviesRoutes;