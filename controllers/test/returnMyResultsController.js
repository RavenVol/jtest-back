const JWT = require('jsonwebtoken');
const { secret } = require('../../config/keys').jwt;
const getRecordsFromTable = require('../helpers/getRecordsFromTable');

const returnMyResultsController = async(req, res) => {
  console.log('returnMyResultsController');
  const body = JSON.parse(JSON.stringify(req.body));
  const { token } = body;

  let user_id = '';
  if (token, typeof(token) === 'string') {
    user_id = JWT.verify(token, secret).sub;
  }

  if (!user_id) {
    return res.json({message : 'bad_request'});
  }

  const results = await getRecordsFromTable('testing', `user_id = "${user_id}"`);

  if (results.length === 0) {
    return res.json({message : 'no_results'});
  }

  const tests = await getRecordsFromTable('test', results.map(result => `id = "${result.test_id}"`).join(' OR '));
  const test_names = await getRecordsFromTable('test_name', results.map(result => `test_id = "${result.test_id}"`).join(' OR '));

  results.forEach(result => {
    result.test_name = {};
    test_names.filter(name => name.test_id === result.test_id)
    .forEach(name => result.test_name[name.lang] = name.text);

    result.type = tests.filter(test => test.id === result.test_id)[0].type;
  });

  res.json({message : 'OK', results : results});
}

module.exports = returnMyResultsController;