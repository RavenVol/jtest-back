const db = require('../../config/db');
const getRecordsFromTable = require('../helpers/getRecordsFromTable');
const getOneFromTable = require('../helpers/getOneFromTable');
const getUserInfo = require('../getUser/getUserInfo');

/**
 * Responds with test info if request contains correct testID
 * @param {*} req 
 * @param {*} res 
 * @async
 */
const returnTestController = async(req, res) => {
  console.log('returnTestController');
  // Simple validation
  if (req.params[0].length !== 16) {
    return res.json({message: 'Wrong test request.'});
  }

  // Getting Data
  const test = await getOneFromTable('test', `id="${req.params[0]}"`);
  if (!test.id) return res.json({message: 'No tests found.'});

  const author = await getUserInfo(test.user_id);

  const name = {};
  const test_names = await getRecordsFromTable('test_name', `test_id="${test.id}"`);
  test_names.forEach(test_name => name[test_name.lang] = test_name.text);

  const test_langs = await getRecordsFromTable('test_lang', `test_id="${test.id}"`);
  const langs = test_langs.map(lang => lang.lang);

  const questionsAssigned = await getRecordsFromTable('question', `test_id="${test.id}" AND status="published"`);

  const question_qtty = +test.question_qtty < questionsAssigned.length 
    ? +test.question_qtty > 0
      ? +test.question_qtty
      : questionsAssigned.length
    : questionsAssigned.length;

  // Calculating avarage test time in minutes
  const averageTime = Math.ceil(questionsAssigned.reduce((acc, question) => {
    return acc + question.timeout;
  }, 0) / (questionsAssigned.length * 60)) * question_qtty;

  // Prepearing reply object
  const returnedTest = {
    id: test.id,
    author: `${author.first_name} ${author.family_name}`,
    photo_url: author.photo_url,
    langs,
    type: test.type,
    question_qtty,
    retry: test.retry,
    time: averageTime,
    name
  }

  res.status(200).json(returnedTest);
}

module.exports = returnTestController;