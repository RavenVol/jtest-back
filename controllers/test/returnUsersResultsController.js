const JWT = require('jsonwebtoken');
const { secret } = require('../../config/keys').jwt;
const allowedProviders = require('../../config/providers-cfg').allowedProviders;

const getRecordsFromTable = require('../helpers/getRecordsFromTable');
const isUserExist = require('../testingDBData/isUserExist');

/**
 * Responding with author's tests info including info about results of users that passed tests
 * @param {*} req 
 * @param {*} res 
 */
const returnUsersResultsController = async(req, res) => {
  console.log('returnUsersResultsController');
  const body = JSON.parse(JSON.stringify(req.body));
  const { token } = body;

  let user_id = '';
  // Little validation
  if (token && typeof(token) === 'string') {
    user_id = JWT.verify(token, secret).sub;
  }

  if (!user_id || typeof(user_id) !== 'string' || user_id.length !== 16) {
    return res.json({message : 'wrong_request'});
  }

  const userExist = await isUserExist(user_id, 'users');
  if (!userExist) {
    return res.json({message : 'unknown_user'});
  }

  // Getting all author's tests
  const tests = await getRecordsFromTable('test', `user_id="${user_id}"`);

  if (tests.length === 0) {
    return res.json({message : 'no_tests'});
  }
  const tests_names = await getRecordsFromTable('test_name', `${tests.map(test => `test_id = "${test.id}"`).join(' OR ')}`);


  // Getting all testings for user's tests
  const testings = await getRecordsFromTable('testing', `${tests.map(test => `test_id = "${test.id}"`).join(' OR ')}`);
  if (testings.length === 0) {
    return res.json({message : `no_testings`});
  }

  // Getting all users names for all testings
  const uniqueTestsUsersIDs = Array.from(new Set(testings.map(testing => testing.user_id)));
  const providers = await getRecordsFromTable('providers', `${uniqueTestsUsersIDs.map(id => `user_id = "${id}"`).join(' OR ')}`);

  const infos = [...await Promise.all(
    allowedProviders.map(provider => new Promise(res => {
      getRecordsFromTable(`${provider}_user`, `${providers.filter(entry => entry.name === provider).map(entry => `user_id = "${entry.provider_id}"`).join(' OR ')}`)
      .then(info => res(info));
    }))
  )].flat();
  
  const returnTestings = testings.map(testing => {
    const test_name = {};
    tests_names.filter(t_name => t_name.test_id === testing.test_id).forEach(t_name => {
      test_name[t_name.lang] = t_name.text;
    });

    const user = {first_name : '', family_name : ''};
    providers.filter(provider => provider.user_id === testing.user_id)
    .map(provider => infos.filter(info => info.user_id === provider.provider_id)[0])
    .forEach(info => {
      user.first_name = info.first_name || user.first_name;
      user.family_name = info.family_name || user.family_name;
    });

    return ({
      ...testing,
      test_name, 
      type : tests.filter(test => test.id === testing.test_id)[0].type,
      user_name : `${user.first_name} ${user.family_name}`,
    })
  }).map((testing, index, arr) => {
    if (testing.type !== 'social') {
      return testing;
    } 
    if (testing.type === 'social' && arr.indexOf(testing) === index) {
      return ({
        ...testing,
        user_name : `${arr.filter(item => item.test_id === testing.test_id).length}`,
      })
    }
    
    return null;
  }).filter(testing => testing !== null);
  
  res.json({message : 'OK', results : returnTestings});
}

module.exports = returnUsersResultsController;