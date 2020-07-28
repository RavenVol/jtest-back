const router = require('express').Router();
const multer = require('multer');
const passport = require('passport');

const loginController = require('../controllers/auth/loginController');
const registerController = require('../controllers/auth/registerController');
const confirmController = require('../controllers/auth/confirmController');
const { getSocketID, sendInfoToSocket } = require('../controllers/auth/socketHelpers');

const encodeMulter = multer({dest: 'images/avatar'}).any();

// Routes for self authentication
router.post('/login', encodeMulter, loginController);
router.post('/register', encodeMulter, registerController);
router.post('/confirm', encodeMulter, confirmController);

// Routes for JWT authentication
router.post( '/jwt', encodeMulter, passport.authenticate('jwt', { session: false }), (req, res) => res.json({user: req.user}) );

// Routes for Google authentication
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
}));

router.get('/google/redirect', passport.authenticate('google'), getSocketID, sendInfoToSocket);


// Routes for LinkedIn authentication
router.get('/linkedin', (req, res) => {
  console.log(`GET request for LinkedIn-auth resieved`);
});

// Routes for FaceBook authentication
router.get('/facebook', (req, res) => {
  console.log(`GET request for FaceBook-auth resieved`);
});

// Routes for LogOut
router.get('/logout', (req, res) => {
  console.log(`GET request for LogOut resieved`);
});

module.exports = router;