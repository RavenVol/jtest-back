const db = require('../../config/db');
const generateRandomString = require('./generateRandomString');
const isUniqueInField = require('../testingDBData/isUniqueInField');

/**
 * Generates string of specified length that will be unique for specified field in specified table
 * @param {string} table 
 * @param {string} field 
 * @param {number} length 
 * @returns {string} uniqueString
 * @async
 */
const generateUniqueDBFieldString = async(table, field, length) => {
  console.log('generateUniqueDBFieldString');
  let isUnique = false;
  let uniqueString = '';

  while (!isUnique) {
    uniqueString = generateRandomString(length);
    isUnique = await isUniqueInField(table, field, uniqueString);
  }

  return uniqueString;
}

module.exports = generateUniqueDBFieldString;