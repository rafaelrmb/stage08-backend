const { Router } = require('express');
const tagsRoutes = Router();
const TagsController = require('../controllers/TagsController');
const tagsController = new TagsController();
const ensureAuth = require('../middlewares/ensureAuth');


tagsRoutes.get('/', ensureAuth, tagsController.index);

module.exports = tagsRoutes;