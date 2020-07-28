const isUserExist = require('../testingDBData/isUserExist');
const getUserEmails = require('./getUserEmails');
const getUserInfo = require('./getUserInfo');

const getUserFromDB = async(id) => {
  console.log('getUserFromDB');
  const userExist = await isUserExist(id, 'users');
  let user = {};

  if (userExist) {
    user = await getUserInfo(id);
    user.id = id;
    user.emails = await getUserEmails(id);
  }

  return(user);
}

module.exports = getUserFromDB;