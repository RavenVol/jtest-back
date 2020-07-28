/**
 * Generates random string
 * @param {number} length
 * @return {string}
 */
const generateRandomString = (length) => {
  console.log('generateRandomString');
  let randomString = '';
  const allowedSymbols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
  'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w',
  'x', 'y', 'z',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 
  'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  for (let i = 1; i <= length; i++) {
    randomString += allowedSymbols[Math.floor(Math.random() * allowedSymbols.length)];
  }

  return randomString;
};

module.exports = generateRandomString;
