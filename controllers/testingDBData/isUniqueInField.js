const db = require('../../config/db');

/**
 * Testing if value unique in table-field
 * @param {string} table 
 * @param {string} field 
 * @param {*} value 
 * @returns {boolean} isUnique
 * @async
 */
const isUniqueInField = async(table, field, value) => {
  console.log('isUniqueInField');
  const isUnique = await new Promise((resolve, reject) => {
    db.query(`SELECT ${field} FROM ${table} WHERE ${field}="${value}"`, (error, result) => {
      if (error) {
        console.warn(`Error while testing ${uniqueString} in ${field}@${table} for uniqe: ${error}`);
        reject(error);
      } else if (!result[0]) {
        resolve(true);
      }
      resolve(false);
    });
  });

  return isUnique;
}

module.exports = isUniqueInField;