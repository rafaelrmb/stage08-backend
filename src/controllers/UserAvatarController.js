const knex = require('../database/knex');
const DiskStorage = require('../providers/DiskStorage');

class UserAvatarController {
  async update(req, res) {
    const user_id = req.user.id;
    const avatarFilename = req.file.filename;
    const diskStorage = new DiskStorage();

    const user = await knex('users').where({ id: user_id }).first();

    if (!user) {
      response.status(401);
      throw new Error('User not allowed to change profile picture');
    }

    if (user.avatar) {
      await diskStorage.deleteFile(user.avatar);
    }

    const filename = await diskStorage.saveFile(avatarFilename);
    user.avatar = filename;

    try {
      await knex('users').update(user).where({ id: user_id });
      return res.status(200).json(user);
    } catch (error) {
      throw new Error('Could not update the user info');
    }

  }
}

module.exports = UserAvatarController;