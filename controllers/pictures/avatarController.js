const db = require('../../config/db');
const fs = require('fs');

const avatarController = (req, res) => {
  fs.readFile(`./images/avatar/${req.params[0]}`, (error, avatar) => {
    if (error) console.warn(error);
    if (avatar) {
      res.end(avatar);
    }
  });
}

module.exports = avatarController;
