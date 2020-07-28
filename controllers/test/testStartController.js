const db = require('../../config/db');
const JWT = require('jsonwebtoken');
const { secret } = require('../../config/keys').jwt;

const getRecordsFromTable = require('../helpers/getRecordsFromTable');
const getOneFromTable = require('../helpers/getOneFromTable');
const isUserExist = require('../testingDBData/isUserExist');
const generateUniqueDBFieldString = require('../misc/generateUniqueDBFieldString');

const testStartController = async(req, res) => {
  console.log('testStartController');
  const body = JSON.parse(JSON.stringify(req.body));
  const { token, test_id } = body;

  if (!token || typeof(token) !== 'string' || !test_id || typeof(test_id) !== 'string' || test_id.length !== 16) {
    return res.json({message: 'wrong_request'});
  }

  const user_id = JWT.verify(body.token, secret).sub;
  if (!user_id || user_id.length !== 16) return res.json({message: 'wrong_user'});

  const userExist = await isUserExist(user_id, 'users');
  if (!userExist) return res.json({message: 'wrong_user'});

  const test = await getOneFromTable('test', `id="${test_id}"`);
  if (!test.id) return res.json({message: 'wrong_test'});

  let userAllowed = false;
  const user_testings = await getRecordsFromTable('testing', `test_id="${test_id}" AND user_id="${user_id}" ORDER BY pass_date DESC`);
  if (user_testings.length === 0) {
    userAllowed = true;
  } else if ( test.type !== 'social'
    && new Date(user_testings[0].pass_date).getTime() <= (Date.now() - test.retry*24*60*60*1000)
  ) {
    userAllowed = true;
  }

  if (!userAllowed && test.type === 'social') {
    return res.json({message: 'social', testing_id: user_testings[0].id});
  } else if (!userAllowed && test.type !== 'social') {
    return res.json({message: 'retry_limit', testting_id: user_testings[0].id}); 
  }

  const testing_id = await generateUniqueDBFieldString('testing', 'id', 16);
  db.query(`INSERT INTO testing (id, test_id, user_id) VALUES ("${testing_id}", "${test_id}", "${user_id}")`, (error) => {
    if (error) console.warn(error);
  });

  const questions = await getRecordsFromTable('question', `test_id="${test_id}" AND status="published"`);
  if (questions.length === 0) {
    return res.json({message: 'no_questions'});
  }
  
  const questionsQtty = questions.length < test.question_qtty || test.question_qtty === 0
    ? questions.length
    : test.question_qtty;

  let questions_left = [];
  if (test.questions_order === 'order') {
    questions.sort((a, b) => a.position - b.position);
    questions_left = questions.map(question => question.id);
  } else {
    for (let i = 0; i < questionsQtty; i++) {
      questions_left.push(questions.splice(Math.floor(Math.random() * questions.length), 1)[0].id);
    }
  }

  db.query(`INSERT INTO testing_questions (testing_id, questions_left, questions_pass) VALUES ("${testing_id}", "${questions_left.join(',')}", "")`, (error) => {
    if (error) console.warn(error);
    res.json({message: 'OK', testing_id});
  });
}

module.exports = testStartController;