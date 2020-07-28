const db = require('../../config/db');
const JWT = require('jsonwebtoken');
const { secret } = require('../../config/keys').jwt;

const getRecordsFromTable = require('../helpers/getRecordsFromTable');
const getOneFromTable = require('../helpers/getOneFromTable');
const getTestAllowedUserIDs = require('../misc/getTestAllowedUserIDs');
const generateUniqueDBFieldString = require('../misc/generateUniqueDBFieldString');

const saveTestResultController = async(req, res) => {
  console.log('saveTestResultController');
  const body = JSON.parse(JSON.stringify(req.body));
  const { token, testing_id } = body;
  
  let user_id = '';
  // A little validation with user_id retreaving
  if (token && typeof(token) === 'string') {
    user_id = JWT.verify(token, secret).sub;
  } else {
    return res.json({message: 'Incorrect UserID'});
  }

  const testingIdCorrect = (testing_id && typeof(testing_id) === 'string' && testing_id.length === 16)
    ? true
    : false;

  // Getting testing info from DB
  let testing = {};
  if (testingIdCorrect) {
    testing = await getOneFromTable('testing', `id="${testing_id}" AND user_id="${user_id}"`);
  } else {
    return res.json({message: 'Test ID corrupted.'});
  }
  
  if (!testing.id) {
    return res.json({message: `Testing ${testing_id} does not belongs to user ${user_id}`});
  }

  const testing_questions = await getOneFromTable('testing_questions', `testing_id="${testing_id}"`);
  const question_ids = testing_questions.questions_left.split(',');

  // Getting test info from DB
  const test = await getOneFromTable('test', `id="${testing.test_id}"`);

  let allowed_ids = null;
  if (test.edit_rights === 'selected') {
    allowed_ids = await getTestAllowedUserIDs(testing.test_id);
  }

  // Verify if test results can be modify
  if ( testing.completed === 'true' 
    && user_id !== test.user_id 
    && (!allowed_ids || !allowed_ids.some(id => id === user_id))
  ) {
    return res.json({message: 'Testing results are already been saved!'});
  }

  if (test.type && test.type !== 'social') {
    // Getting all user aswer for testing
    const userAnswers = await getRecordsFromTable(`${test.type}_answer`, `testing_id="${testing.id}"`);

    // Getting test questions
    // const question_ids = Array.from(new Set(userAnswers.map(answer => answer.question_id)));
    const questions = await getRecordsFromTable('question', `${question_ids.map(id => `id="${id}"`).join(' OR ')}`);

    // Getting test answers
    const correctAnswers = await getRecordsFromTable('answer', `${question_ids.map(id => `question_id="${id}"`).join(' OR ')}`);

    // Getting answers text
    const correctAnswers_ids = correctAnswers.map(answer => answer.id);
    const correctAnswers_text = await getRecordsFromTable('answer_text', `${correctAnswers_ids.map(id => `answer_id="${id}"`).join(' OR ')}`);

    // Calculating maximum score
    const max_score = questions.reduce((acc, question) => {
      return (acc + question.price);
    }, 0);

    // Calculating user score
    const user_score = questions.reduce((acc, question) => {
      const userAnswer_forQuestion = userAnswers.filter(answer => answer.question_id === question.id);
      const correctAnswer_forQuestion = correctAnswers.filter(answer => answer.question_id === question.id);
      const answerPrice = question.price / userAnswer_forQuestion.length;
      let summ = 0;

      if (question.type === 'oneofmany') {
        summ = userAnswer_forQuestion.every(answer => answer.user_answer === correctAnswer_forQuestion.filter(c_answer => c_answer.id === answer.answer_id)[0].correct)
          ? question.price
          : 0;
      }

      if (question.type === 'manyofmany') {
        summ = (userAnswer_forQuestion.reduce((acc, answer) => {
          return (answer.user_answer === correctAnswer_forQuestion.filter(c_answer => c_answer.id === answer.answer_id)[0].correct
          ? acc + answerPrice
          : acc)
        }, 0) - question.price / 2) * 2;
      }

      if (question.type === 'setorder') {
        summ = (userAnswer_forQuestion.reduce((acc, answer) => {
          return (+answer.user_answer === correctAnswer_forQuestion.filter(c_answer => c_answer.id === answer.answer_id)[0].a_order
          ? acc + answerPrice
          : acc)
        }, 0) - question.price / 2) * 2;
      }

      if (question.type === 'findmatch') {
        summ = userAnswer_forQuestion.reduce((acc, answer) => {
          return (answer.user_answer === answer.answer_id
          ? acc + answerPrice
          : acc)
        }, 0);
      }

      if (question.type === 'freeanswer') {
        const fa_ids = correctAnswer_forQuestion.map(answer => answer.id);
        const fa_texts = correctAnswers_text.filter(answer => fa_ids.includes(answer.answer_id)).map(answer => answer.text);
        const fa_texts_low_trim = fa_texts.map(text => text.toLowerCase().trim());

        if (fa_texts.length > 0) {
          if (fa_texts.includes(userAnswer_forQuestion[0].user_answer)
          || fa_texts_low_trim.includes(userAnswer_forQuestion[0].user_answer.toLowerCase().trim())) {
            summ = question.price;
          } else {
            summ = 0;
          }
        } else {
          summ = 0;
        }
      }

      summ = summ < 0 ? 0 : summ;
      summ = summ > question.price ? question.price : summ;

      return (acc + summ);
    }, 0);

    db.query(`UPDATE testing SET result="${Math.ceil(user_score / max_score * 10000)}", completed="true" WHERE id="${testing_id}"`, (error, result) => {
      if (error) {
        console.warn(error);
      } else {
        res.json({message: 'OK'});
      }
    });
  } else {
    generateUniqueDBFieldString('social_answer', 'testing_id', 17)
    .then(newTestingId => {
      db.query(`UPDATE social_answer SET testing_id="${newTestingId}" WHERE testing_id="${testing_id}@"`, (error, result) => {
        if (error) {
          console.warn(error)
        } else {
          db.query(`UPDATE testing SET completed="true" WHERE id="${testing_id}"`, (error, result) => {
            if (error) {
              console.warn(error);
            } else {
              res.json({message: 'OK'});
            }
          });
        }
      })
    });
  }
}

module.exports = saveTestResultController;