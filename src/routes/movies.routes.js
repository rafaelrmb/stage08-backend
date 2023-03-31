const { Router } = require("express");
const MoviesController = require("../controllers/MoviesController");
const ensureAuth = require("../middlewares/ensureAuth");
const moviesController = new MoviesController();
const moviesRoutes = Router();

moviesRoutes.use(ensureAuth);
moviesRoutes.get("/", moviesController.index);
moviesRoutes.post("/", moviesController.create);
moviesRoutes.get("/:id", moviesController.show);
moviesRoutes.delete("/:id", moviesController.delete);
moviesRoutes.put("/:id", moviesController.update)
module.exports = moviesRoutes;