const db = require('../../config/db');

/**
 * Gets an array of user emails from DB
 * @param {string} id 
 * @return {array} user emails strings
 * @async
 */
const getUserEmails = async(id) => {
  console.log('getUserEmails');
  const emails = await new Promise((resolve, reject) => {
    db.query(`SELECT mail FROM emails WHERE user_id="${id}"`, (error, result) => {
      if (error) {
        console.warn(`Error while getting user emails for id=${id} from DB.emails: ${error}`);
        resolve([]);
      } else if (result[0]) {
        resolve([...result.map(record => record.mail)]);
      } else {
        console.warn(`Warning user with id=${id} has no emails`);
        resolve([]);
      }
    });
  });

  return emails;
}

module.exports = getUserEmails;
