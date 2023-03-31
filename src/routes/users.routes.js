const { Router } = require("express");
const UsersController = require("../controllers/UsersController");
const usersRoutes = Router();
const usersController = new UsersController();
const ensureAuth = require('../middlewares/ensureAuth');

usersRoutes.post("/", usersController.create);
usersRoutes.put("/", ensureAuth, usersController.update);

module.exports = usersRoutes;