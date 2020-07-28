const db = require('../../config/db');
const getOneFromTable = require('../helpers/getOneFromTable');

/**
 * Adds record to DB "providers" table to connect existing user 
 * and information in <provider>_user table.
 * @async
 * @param {string} providerName
 * @param {string} userId
 * @param {string} providersUserId
 * @return {void}
 */

const addProviderEntry = async(providerName, userId, providersUserId) => {
  console.log('addProviderEntry');
  // If entry does not exist add record to table.
  const provider = await getOneFromTable('providers', `user_id="${userId}" AND name="${providerName}"`);
  if (!provider.user_id) {
    db.query(`INSERT INTO providers (name, user_id, provider_id) VALUES ("${providerName}", "${userId}", "${providersUserId}")`, (error) => {
      if (error) console.warn(error);
    });
  }
}

module.exports = addProviderEntry;