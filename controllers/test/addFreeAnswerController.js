const db = require('../../config/db');
const JWT = require('jsonwebtoken');
const { secret } = require('../../config/keys').jwt;

const addAnswerController = require('./addAnswerController');
const validateAddFreeAnswer = require('../validators/validateAddFreeAnswer');
const getOneFromTable = require('../helpers/getOneFromTable');
const isUserExist = require('../testingDBData/isUserExist');
const getTestAllowedUserIDs = require('../misc/getTestAllowedUserIDs');

const addFreeAnswerController = async(req, res) => {
  console.log('addFreeAnswerController');
  const body = JSON.parse(JSON.stringify(req.body));
  body.langs = JSON.parse(body.langs);
  body.answer = JSON.parse(body.answer);

  const valid = validateAddFreeAnswer(body);

  if (!valid) return res.json({message: 'Invalid data was send to server'});

  const {token, question_id, question_type, langs, answer} = body;

  const user_id = JWT.verify(token, secret).sub;
  
  if (user_id && user_id.length === 16) {
    const userExist = await isUserExist(user_id, 'users');
    if (userExist) {
      const question = await getOneFromTable('question', `id="${question_id}"`);
      const test_id = question.test_id;
      const test = await getOneFromTable('test', `id="${test_id}"`);
      
      let allowed_ids = null;
      if (test.edit_rights === 'selected') {
        allowed_ids = await getTestAllowedUserIDs(test_id);
      }

      if (user_id === test.user_id || (allowed_ids && allowed_ids.some(id => user_id === id))) {
        answer.order = answer.a_order;
        addAnswerController(question_id, question_type, langs, answer);
        return res.json({message: 'OK'});
      } else {
        return res.json({message: 'Not allowed'});
      }
    } else {
      return res.json({message: 'Unknown user'});
    }
  } else {
    return res.json({message: 'Unknown user'});
  }
}

module.exports = addFreeAnswerController;