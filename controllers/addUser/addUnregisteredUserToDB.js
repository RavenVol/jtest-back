const db = require('../../config/db');
const fs = require('fs');
const generateUniqueDBFieldString = require('../misc/generateUniqueDBFieldString');

/**
 * @param {object} user
 * @returns {string} secret
 * @async
 */
const addUnregisteredUserToDB = async(user) => {
  console.log('addUnregisteredUserToDB');
  let secret = await generateUniqueDBFieldString('unregistered_user', 'secret', 32);
  
  const existingUser = await new Promise((resolve, reject) => {
    db.query(`SELECT * FROM unregistered_user WHERE email="${user.email}"`, (error, result) => {
      if (error) {
        console.warn(`Error while searcing ${user.email} in unregistered_user: ${error}`);
        reject(error);
      } else if (result[0]) {
        resolve(result[0]);
      } else {
        resolve(false);
      }
    });
  });

  if (!existingUser) {
    db.query(`
    INSERT INTO unregistered_user 
    (secret, email, password, first_name, family_name, gender, photo, reg_date) 
    VALUES ("${secret}", "${user.email}", "${user.password}", "${user.first_name}", "${user.family_name}",  "${user.gender}",  "${user.photo}", NOW())`,
    (error, result) => {
      if (error) {
        console.warn(`Error while adding user to unregistered_user: ${error}`);
      }
    });
  } else {
    secret = existingUser.secret;

    // deleting user old avatar
    existingUser.photo && fs.unlinkSync(`images/avatar/${existingUser.photo}`);
    
    // updating user record in unregistered_user table
    db.query(`
    UPDATE unregistered_user 
    SET password="${user.password}", first_name="${user.first_name}", 
    family_name="${user.family_name}", gender="${user.gender}", 
    photo="${user.photo}", reg_date=NOW() WHERE email="${user.email}"`, (error, result) => {
      if (error) {
        console.warn(`Error while updating unregistered_user: ${error}`);
      }
    });
  }
  
  return secret;
}

module.exports = addUnregisteredUserToDB;