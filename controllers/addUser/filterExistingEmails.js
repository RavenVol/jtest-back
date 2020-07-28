const db = require('../../config/db');

/**
 * Seperates emails that are exist in DB from thouse 
 * that are not.
 * @param {array} emails
 * @returns {array} [existingEmail [{mail: string, user_id: string}, ...], newEmail = [string, string, ...]]
 * @async
 */
const filterExistingEmails = async(emails) => {
  console.log('filterExistingEmails');
  const emailsPrepaired = await Promise.all(
    emails.map((email) => new Promise((resolve, reject) => {
      db.query(`SELECT * FROM emails WHERE mail="${email.value}"`, (error, result) =>{
        if (error) {
          console.warn(`Error while seeking ${email.value} in emails: ${error}`);
          reject(error);
        } else if (result[0]) {
          resolve({
            mail: result[0].mail, 
            user_id: result[0].user_id
          });
        } else {
          resolve(email.value);
        }
      });
    }))
  );

  const existingEmails = emailsPrepaired.filter(email => typeof(email) === 'object');
  const newEmails = emailsPrepaired.filter(email => typeof(email) === 'string');

  return [existingEmails, newEmails];
}

module.exports = filterExistingEmails;