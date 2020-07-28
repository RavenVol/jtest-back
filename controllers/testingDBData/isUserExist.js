const db = require('../../config/db');

/**
 * Checks if user with the id exist in DB
 * @param {string} id 
 * @param {string} table
 * @return {boolean}
 * @async
 */

const isUserExist = async(id, table) => {
  console.log('isUserExist');
  const userExist = await new Promise((resolve, reject) => {
    db.query(`SELECT user_id FROM ${table} WHERE user_id="${id}"`, (error, result) => {
      if (error) {
        console.warn(`isUserExist: Error while seeking user with user_id=${id} in ${table} table: ${error}`);
        resolve(false);
      } else if (!result[0]) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });

  return userExist;
}

module.exports = isUserExist;
