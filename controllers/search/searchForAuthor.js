const getRecordsFromTable = require('../helpers/getRecordsFromTable');
const providers = require('../../config/providers-cfg').allowedProviders;

/**
 * Searching tests in DB with authors that are fit to search request
 * @async
 * @param {array} search
 * @returns {array} tests
 */
const searchForAuthor = async(search) => {
  console.log('searchForAuthor');

  // getting users, that are match to search request
  let provider_users = []
  for (let provider of providers) {
    provider_users = provider_users.concat(await getRecordsFromTable(`${provider}_user`, `${search.map(word => `first_name LIKE "%${word}%" OR family_name LIKE "%${word}%" OR user_id LIKE "%${word}%"`).join(' OR ')}`));
  }

  let users_ids = await getRecordsFromTable('providers', `${provider_users.map(user => `provider_id = "${user.user_id}"`).join(' OR ')}`);
  
  let users_unfiltered = provider_users.map(user => ({
    id: users_ids.filter(record => record.provider_id === user.user_id)[0].user_id,
    name: `${user.first_name} ${user.family_name}`,
  }));
  
  const users = [];
  for (let i = 0; i < users_unfiltered.length; i++) {
    if (users.some(user => user.id === users_unfiltered[i].id)) continue;
    users.push(users_unfiltered[i]);
  }

  provider_users = users_ids = users_unfiltered = null;

  // looking for tests that belongs to users
  let tests = await getRecordsFromTable('test', `${users.map(user => `user_id = "${user.id}"`).join(' OR ')}`);
  let tests_names = await getRecordsFromTable('test_name', `${tests.map(test => `test_id = "${test.id}"`).join(' OR ')}`);

  const returnedTests = tests.map(test => {
    const name = {};
    tests_names.filter(test_name => test_name.test_id === test.id).forEach(test_name => name[test_name.lang] = test_name.text);
    return ({
      id: test.id,
      type: test.type,
      test_name: name,
      author: users.filter(user => user.id === test.user_id)[0].name,
    });
  });
  
  return returnedTests;
}

module.exports = searchForAuthor;