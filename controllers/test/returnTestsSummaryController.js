const db = require('../../config/db');
const getRecordsFromTable = require('../helpers/getRecordsFromTable');
const getUserInfo = require('../getUser/getUserInfo');

/**
 * Responds with all test summary info
 * @param {*} req 
 * @param {*} res 
 */
const returnTestsSummaryController = async(req, res) => {
  console.log('returnTestsSummaryController');
  
  const tests = await getRecordsFromTable('test', 'status="published"');
  if (tests.length === 0) {
    return res.json({message : 'no_tests'})
  }

  const tests_langs = await getRecordsFromTable('test_lang', tests.map(test => `test_id="${test.id}"`).join(' OR '));
  const tests_names = await getRecordsFromTable('test_name', tests.map(test => `test_id="${test.id}"`).join(' OR '));
  const questions = await getRecordsFromTable('question', tests.map(test => `(test_id="${test.id}" AND status="published")`).join(' OR '));

  const foo = await Promise.all(
    tests.map(async(test) => {
      const author = await getUserInfo(test.user_id);
      test.author = `${author.first_name} ${author.family_name}`;
      test.langs = tests_langs.filter(test_lang => test_lang.test_id === test.id).map(test_lang => test_lang.lang);
      
      test.name = {};
      tests_names.filter(test_name => test_name.test_id === test.id)
      .forEach(test_name => test.name[test_name.lang] = test_name.text);
      
      const test_questions = questions.filter(question => question.test_id === test.id);
      test.question_qtty = +test.question_qtty < test_questions.length
        ? +test.question_qtty > 0
          ? +test.question_qtty
          : test_questions.length
        : test_questions.length;

      test.time = Math.ceil(test_questions.reduce((acc, question) => {
        return acc + question.timeout;
      }, 0) / (test_questions.length * 60)) * test.question_qtty;

      delete test.user_id;
      delete test.edit_rights;
      delete test.category;
      delete test.status;
    })
  );

  res.json({message : 'OK', testsSummary : tests});
}

module.exports = returnTestsSummaryController;