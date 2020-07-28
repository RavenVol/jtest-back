const db = require('../../config/db');

/**
 * Returns first of records that are match conditions
 * from appropriate table of DB
 * @param {string} table 
 * @param {string} condition 
 * @returns {object} records
 * @async
 */
const getOneFromTable = async(table, condition) => {
  console.log('getRecordsFromTable');
  if (!condition) {
    return {};
  }

  const records = await new Promise((resolve) => {
    db.query(`SELECT * FROM ${table} ${condition === 'all' ? '' : `WHERE ${condition}`}`, (error, result) => {
      if (error) {
        console.warn(`Error while getting record from ${table} with ${condition}: ${error}`);
        resolve({});
      } else if (result[0]) {
        resolve({...result[0]});
      } else {
        resolve({});
      }
    });
  });

  return(records);
}

module.exports = getOneFromTable;