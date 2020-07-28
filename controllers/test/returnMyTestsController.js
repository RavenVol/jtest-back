const JWT = require('jsonwebtoken');
const { secret } = require('../../config/keys').jwt;

const getRecordsFromTable = require('../helpers/getRecordsFromTable');

/**
 * Responds with all test that belongs to user
 * @param {*} req 
 * @param {*} res
 */
const returnMyTestsController = async(req, res) => {
  console.log('returnMyTestsController');

  const body = JSON.parse(JSON.stringify(req.body));
  const { token } = body;

  if ( !token || typeof(token) !== 'string') {
    return res.json({message: 'wrong_request'});
  }

  const user_id = JWT.verify(token, secret).sub;
  
  const tests = await getRecordsFromTable('test', `user_id = "${user_id}"`);
  if (tests.length === 0) {
    return res.json({message: 'no_tests'});
  }

  const tests_names = await getRecordsFromTable('test_name', tests.map(test => `test_id="${test.id}"`).join(' OR '));
  tests.forEach(test => {
    test.name = {};
    tests_names.filter(test_name => test_name.test_id === test.id)
    .forEach(test_name => test.name[test_name.lang] = test_name.text);
  });
  
  res.json({
    message: 'OK', 
    testsSummary : tests.map(test => ({
      id : test.id,
      type : test.type,
      name : test.name,
      status : test.status,
    })),
  });
}

module.exports = returnMyTestsController;