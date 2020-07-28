const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;

const addUserToDB = require('../controllers/addUser/addUserToDB');
const getUserFromDB = require('../controllers/getUser/getUserFromDB');
const {JWT_CONFIG, GOOGLE_CONFIG, TWITTER_CONFIG, FACEBOOK_CONFIG, LINKEDIN_CONFIG, GITHUB_CONFIG} = require('./providers-cfg');

passport.serializeUser((user, done) => {
  console.log('passport-cfg/passport.serializeUser');
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  console.log('passport-cfg/passport.deserializeUser');
  getUserFromDB(id)
    .then(user => done(null, user))
    .catch(error => done(error, null));
});

const JwtCB = async(token, done) => {
  console.log('passport-cfg/JwtCB');
  getUserFromDB(token.sub)
    .then(user => done(null, user))
    .catch(error => done(error, null));
}

const GoogleCB = (accessToken, refreshToken, profile, done) => {
  console.log('passport-cfg/GoogleCB');
  addUserToDB('google', profile).then(userId => done(null, userId));    
};

passport.use(new JwtStrategy(JWT_CONFIG, JwtCB));
passport.use(new GoogleStrategy(GOOGLE_CONFIG, GoogleCB));
