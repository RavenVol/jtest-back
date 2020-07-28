const db = require('../../config/db');

/**
 * Returns array of records that are match conditions
 * from appropriate table of DB
 * set condition = 'all' to get all records from table
 * @param {string} table 
 * @param {string} condition 
 * @returns {array} records
 * @async
 */
const getRecordsFromTable = async(table, condition) => {
  console.log('getRecordsFromTable');

  if (!table || !condition) {
    return [];
  } 

  const records = await new Promise((resolve) => {
    db.query(`SELECT * FROM ${table} ${condition === 'all' ? '' : `WHERE ${condition}`}`, (error, result) => {
      if (error) {
        console.warn(`Error while getting record from ${table} with ${condition}: ${error}`);
        resolve([]);
      } else if (result[0]) {
        resolve(result.map(res => ({...res})));
      } else {
        resolve([]);
      }
    });
  });

  return(records);
}

module.exports = getRecordsFromTable;