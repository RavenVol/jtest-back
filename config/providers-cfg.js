const { ExtractJwt } = require('passport-jwt');
const keys = require('./keys');

const providers = ['jwt', 'google', 'twitter', 'facebook', 'linkedin', 'github'];

exports.allowedProviders = ['self', 'google'];

const callbacks = providers.map(provider => {
  return process.env.NODE_ENV === 'production'
    ? `` // real server redirection here
    : `/api/auth/${provider}/redirect`;
})

const [jwtURL, googleURL, twitterURL, facebookURL, linkedinURL, githubURL] = callbacks;

exports.JWT_CONFIG = {
  jwtFromRequest: ExtractJwt.fromBodyField('auth_token'),
  secretOrKey: keys.jwt.secret
}

exports.GOOGLE_CONFIG = {
  clientID: keys.google.clientID,
  clientSecret: keys.google.clientSecret,
  scope: ['profile', 'email'],
  callbackURL: googleURL,
}

exports.TWITTER_CONFIG = {
  consumerKey: keys.twitter.consumerKey,
  consumerSecret: keys.twitter.consumerSecret,
  callbackURL: twitterURL,
}

exports.FACEBOOK_CONFIG = {
  clientID: keys.facebook.clientID,
  clientSecret: keys.facebook.clientSecret,
  profileFields: ['id', 'emails', 'name', 'picture.width(250)'],
  callbackURL: facebookURL,
}

exports.LINKEDIN_CONFIG = {
  clientID: keys.linkedin.clientID,
  clientSecret: keys.linkedin.clientSecret,
  scope: ['r_emailaddress', 'r_basicprofile'],
  callbackURL: linkedinURL,
}

exports.GITHUB_CONFIG = {
  clientID: keys.github.clientID,
  clientSecret: keys.github.clientSecret,
  callbackURL: githubURL
}
