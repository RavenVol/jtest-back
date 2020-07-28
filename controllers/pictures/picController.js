const fs = require('fs');

const picController = (req, res) => {
  fs.readFile(`./images/pics/${req.params[0]}`, (error, pic) => {
    if (error) console.warn(error);
    if (pic) {
      res.end(pic);
    }
  });
}

module.exports = picController;
