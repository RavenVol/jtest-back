const router = require('express').Router();
const avatarController = require('../controllers/pictures/avatarController');
const picController = require('../controllers/pictures/picController');

router.get('/avatar*', avatarController);
router.get('/pic*', picController);

module.exports = router;