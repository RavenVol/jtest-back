const JWT = require('jsonwebtoken');
const { iss, secret } = require('../../config/keys').jwt;

const accessToken = (sub) => {
  console.log('accessToken');
  return JWT.sign({
    iss, sub,
    iat: new Date().getTime(),
    exp: new Date().setDate(new Date().getDate() + 1),
  }, secret);
}

module.exports = accessToken;