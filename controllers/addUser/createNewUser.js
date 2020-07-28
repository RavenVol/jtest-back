const db = require('../../config/db');
const generateUniqueDBFieldString = require('../misc/generateUniqueDBFieldString');
/**
 * Generates unique user ID
 * Creates new user entry in DB "users" table
 * @async
 * @return {string} userId
 */
const createNewUser = async() => {
  console.log('createNewUser');
  const userId = await generateUniqueDBFieldString('users', 'user_id', 16);
  
  // Adding new user into users table
  const userWasCreated = await new Promise((resolve, reject) => {
    db.query(`INSERT INTO users (user_id) VALUES ("${userId}")`, (error, result) => {
      if (error) {
        console.warn(`Error while creating new user in users table: ${error}`);
        resolve(false);
      }
      resolve(true);
    });
  });

  if (userWasCreated) {
    return userId;
  } else {
    return '';
  }
}

module.exports = createNewUser;