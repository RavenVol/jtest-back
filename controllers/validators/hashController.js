const bcrypt = require('bcrypt');

/**
 * Creates hash for plainData
 * @param {string} plainData 
 * @returns {string} hash
 */
const createHash = (plainData) => {
  console.log('createHash');
  return (bcrypt.hashSync(plainData, bcrypt.genSaltSync(10)));
}

/**
 * Indicates if hash matches to plainData
 * @param {string} plainData 
 * @param {string} hash 
 * @returns {boolean} 
 */
const isHashMatch = (plainData, hash) => {
  console.log('isHashMatch');
  return (bcrypt.compareSync(plainData, hash));
}

module.exports = {createHash, isHashMatch};