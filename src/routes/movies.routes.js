const { Router } = require("express");
const MoviesController = require("../controllers/MoviesController");
const moviesController = new MoviesController();
const moviesRoutes = Router();


moviesRoutes.get("/", moviesController.index);
moviesRoutes.post("/:user_id", moviesController.create);
moviesRoutes.get("/:user_id/:id", moviesController.show);
moviesRoutes.delete("/:user_id/:id", moviesController.delete);

module.exports = moviesRoutes;