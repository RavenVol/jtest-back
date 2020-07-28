const JWT = require('jsonwebtoken');
const { secret } = require('../../config/keys').jwt;

const getRecordsFromTable = require('../helpers/getRecordsFromTable');
const getOneFromTable = require('../helpers/getOneFromTable');

const returnTestDataController = async(req, res) => {
  console.log('returnTestDataController');
  const body = JSON.parse(JSON.stringify(req.body));
  const { token, test_id } = body;

  let user_id = '';
  if (token && typeof(token) === 'string') {
    user_id = JWT.verify(token, secret).sub;
  }

  if (!user_id || !test_id || typeof(test_id) !== 'string' || test_id.length !== 16) {
    return res.json({message: 'Bad test request.'});
  }

  const test = await getOneFromTable('test', `id = "${test_id}" AND user_id = "${user_id}"`);
  if (!test.id) {
    return res.json({message: 'No test found'});
  }

  const test_langs = await getRecordsFromTable('test_lang', `test_id = "${test.id}"`);
  const test_names = await getRecordsFromTable('test_name', `test_id = "${test.id}"`);
  const test_allowed_users = await getRecordsFromTable('test_allowed_user', `test_id = "${test.id}"`);
  const questions = await getRecordsFromTable('question', `test_id = "${test.id}"`);
  let questions_texts = [];
  let answers = [];
  let answers_texts = [];
  let answers_equivalents = [];
  if (questions.length > 0) {
    questions_texts = await getRecordsFromTable('question_text', questions.map(question => `question_id = "${question.id}"`).join(' OR '));
    answers = await getRecordsFromTable('answer', questions.map(question => `(question_id = "${question.id}" AND status="published")`).join(' OR '));
    if (answers.length > 0) {
      answers_texts = await getRecordsFromTable('answer_text', answers.map(answer => `answer_id = "${answer.id}"`).join(' OR '));
      answers_equivalents = await getRecordsFromTable('answer_equivalent', answers.map(answer => `answer_id = "${answer.id}"`).join(' OR '));
    }
  }

  questions.forEach(question => {
    question.answersType = question.answer_type;
    delete question.answer_type;
    delete question.test_id;

    question.text = {};
    test_langs.forEach(record => question.text[record.lang] = '');
    questions_texts.filter(question_text => question_text.question_id === question.id)
    .forEach(text => question.text[text.lang] = text.text);

    question.answers = answers.filter(answer => answer.question_id === question.id);

    question.answers.forEach(answer => {
      answer.text = {};
      answer.equivalent = {};
      test_langs.forEach(record => {
        answer.text[record.lang] = '';
        answer.equivalent[record.lang] = '';
      });

      answers_texts.filter(answer_text => answer_text.answer_id === answer.id)
      .forEach(text => answer.text[text.lang] = text.text);

      answers_equivalents.filter(answer_equivalent => answer_equivalent.answer_id === answer.id)
      .forEach(equivalent => answer.equivalent[equivalent.lang] = equivalent.text);

      answer.order = +answer.a_order;
      delete answer.a_order;
      answer.correct = answer.correct === 'true' ? true : false;
    })
  })

  const names = {};
  test_names.forEach(name => names[name.lang] = name.text);

  const returnedTest = {
    ...test,
    langs: test_langs.map(record => record.lang),
    testName: names,
    testEditUsers: test_allowed_users.map(record => record.user_email),
    questions,
  }

  res.json({message: 'OK', test: returnedTest});
}

module.exports = returnTestDataController;