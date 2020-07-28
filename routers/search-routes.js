const router = require('express').Router();
const multer = require('multer');
const encodeMulter = multer({dest: 'images/tests'}).any();

const barQueryReplyController = require('../controllers/search/barQueryReplyController');

router.post('/barquery', encodeMulter, barQueryReplyController);

module.exports = router;