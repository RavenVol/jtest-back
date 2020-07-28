const db = require('../../config/db');

/**
 * Adds e-mail to DB "emails" table
 * @requires db
 * @param {string} email 
 * @param {string} userId 
 * @returns {void}
 */
const addEmailToDB = (email, userId) => {
  console.log('addEmailToDB');
  db.query(`INSERT INTO emails (user_id, mail) VALUES ("${userId}", "${email}")`, (error, result) => {
    if (error) {
      console.warn(`Error while adding new email ${email} to emails table: ${error}`);
    }
  });
}

module.exports = addEmailToDB;