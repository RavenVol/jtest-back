const db = require('../../config/db');
/**
 * Deleting record from table
 * @param {string} table 
 * @param {string} condition 
 */
const deleteFromTable = (table, condition) => {
  console.log('deleteFromTable');
  db.query(`DELETE FROM ${table} WHERE ${condition}`, (error, result) => {
    if (error) {
      console.warn(`deleteFromTable: Error while deleting from ${table} with conditions ${condition}`);
    }
  });
}

module.exports = deleteFromTable;