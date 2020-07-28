const db = require('../../config/db');
const getRecordsFromTable = require('../helpers/getRecordsFromTable');

/**
 * WARNING! WORKING ONLY FOR TESTS WITH edit_rights === 'selected'
 * Returns allowed users IDs
 * @async
 * @param {string} test_id 
 * @returns {array} allowed_ids
 */
const getTestAllowedUserIDs = async(test_id) => {
  console.log('getTestAllowedUserIDs');
  const allowed_emails = await getRecordsFromTable('test_allowed_user', `test_id="${test_id}"`);
  const allowed_ids = await new Promise((res, rej) => {
    db.query(`SELECT user_id FROM emails WHERE ${allowed_emails.map(allowed => `mail="${allowed.user_email}"`).join(' OR ')}`, (error, ids) => {
      if (error) res(null);

      if (!ids[0]) res(null);

      if (ids[0]) res(ids.map(id => id.user_id));
    });
  });
  return allowed_ids;
}

module.exports = getTestAllowedUserIDs;