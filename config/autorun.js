const clearAnswerInProgress = require('../controllers/test/clearAnswerInProgress');

const autorun = () => {
  console.log('Autorun started');

  clearAnswerInProgress();  
}

module.exports = autorun;