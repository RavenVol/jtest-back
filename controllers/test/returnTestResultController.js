const db = require('../../config/db');
const JWT = require('jsonwebtoken');
const { secret } = require('../../config/keys').jwt;

const isUserExist = require('../testingDBData/isUserExist');
const getRecordsFromTable = require('../helpers/getRecordsFromTable');
const getOneFromTable = require('../helpers/getOneFromTable');
const getQuestionsFromDB = require('../helpers/getQuestionsFromDB');
const getUserInfo = require('../getUser/getUserInfo');

/**
 * Responding with test results
 * @param {*} req 
 * @param {*} res 
 */
const returnTestResultController = async(req, res) => {
  console.log('returnTestResultController');
  const body = JSON.parse(JSON.stringify(req.body));
  const { token, testing_id } = body;

  if ( !token 
    || !testing_id 
    || typeof(token) !== 'string' 
    || typeof(testing_id) !== 'string' 
    || testing_id.length !== 16
  ) {
    return res.json({message: 'wrong_request'});
  }

  let user_id = '';
  if (token && typeof(token) === 'string') {
    user_id = JWT.verify(token, secret).sub;
  } 
  
  if (!user_id || typeof(user_id) !== 'string' || user_id.length !== 16) {
    return res.json({message: 'undefind_user'});
  }

  const userExist = await isUserExist(user_id, 'users');
  if (!userExist) { 
    return res.json({message: 'undefind_user'});
  }

  const testing = await getOneFromTable('testing', `id="${testing_id}"`);
  const test = await getOneFromTable('test', `id="${testing.test_id}"`);

  let allowed = '';
  if ( user_id === test.user_id ) {
    allowed = 'author';
  } else if ( user_id === testing.user_id ) {
    allowed = 'user';
  } else if ( test.edit_rights === 'selected' ) {
    const allowed_users = await getRecordsFromTable('test_allowed_user', `test_id="${test.id}"`);
    const allowed_emails = await getRecordsFromTable('emails', `${allowed_users.map(user => `mail="${user.user_email}"`).join(' OR ')}`);
    const allowed_ids = allowed_emails.map(email => email.user_id);
    if (allowed_ids.includes(user_id)) {
      allowed = 'author';
    }
  }

  if (!allowed) {
    return res.json({message: 'not_allowed'});
  }

  const user = await getUserInfo(testing.user_id);

  const test_name = {};
  const test_names = await getRecordsFromTable('test_name', `test_id="${test.id}"`);
  test_names.forEach(name => test_name[name.lang] = name.text);

  const returnedResult = {
    message: 'OK', 
    testing: {
      test_name,
      test_type: test.type,
      allowed,
      result: testing.result,
      pass_date: testing.pass_date,
      user : {
        name: `${user.first_name} ${user.family_name}`,
        photo_url : `${user.photo_url}`,
      },
    }
  };

  if (test.type === 'social') {
    returnedResult.users_answers = await getRecordsFromTable('social_answer', `test_id="${test.id}"`);
    const uniqueTestUsers = new Set(returnedResult.users_answers.map(answer => answer.testing_id));
    // if (uniqueTestUsers.size < 10) {
    //   return res.json({message: 'stat_unawailable'});
    // }
    returnedResult.testing.unique_users = uniqueTestUsers.size;
    returnedResult.questions = await getQuestionsFromDB(`test_id="${test.id}" AND status="published"`);
    returnedResult.questions.sort((a, b) => a.position - b.position);    
  } else if (test.type === 'education' || allowed === 'author') {
    const testing_questions = await getOneFromTable('testing_questions', `testing_id="${testing.id}"`);
    const all_testing_questions = testing_questions.questions_left.split(',');
    const questions = await getQuestionsFromDB(`${all_testing_questions.map(id => `id="${id}"`).join(' OR ')}`);
    if (test.questions_order === 'order') {
      questions.sort((a, b) => a.position - b.position);
    }

    const user_answers = await getRecordsFromTable(`${test.type}_answer`, `testing_id="${testing.id}"`);
    const u_answers = {};
    user_answers[0] && user_answers.forEach(entry => {
      if (entry.answer_id === 'freeanswer_no_id') {
        u_answers[entry.question_id] = entry.user_answer
      } else {
        u_answers[entry.answer_id] = entry.user_answer
      }
    });

    const comQuestions = questions.map(question => ({
      ...question,
      answers: question.answers[0] 
        ? question.answers.map(answer => ({
            ...answer,  
            user_answer: question.type === 'freeanswer' ? u_answers[question.id] : u_answers[answer.id],
          }))
        : [{id: null, correct: false, a_order: 1, text: '', equivalent: '', user_answer: u_answers[question.id]}]
    }));

    returnedResult.questions = [...comQuestions];
  }
    
  return res.json({...returnedResult});
}

module.exports = returnTestResultController;