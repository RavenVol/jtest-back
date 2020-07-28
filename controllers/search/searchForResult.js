const getRecordsFromTable = require('../helpers/getRecordsFromTable');
const getUserInfo = require('../getUser/getUserInfo');

/**
 * Searching results in DB with ID
 * @async
 * @param {array} search
 * @returns {array} results
 */
const searchForResult = async(search) => {
  console.log('searchForResults');

  const testings = await getRecordsFromTable('testing', `${search.map(word => `id = "${word}"`).join(' OR ')}`);
  
  const returnedResults = await Promise.all (
    testings.map(testing => new Promise (async(res, rej) => {
      const test_names = await getRecordsFromTable('test_name', `test_id = "${testing.test_id}"`);
      const name = {};
      test_names.forEach(test_name => name[test_name.lang] = test_name.text);
      const user = await getUserInfo(testing.user_id);

      res ({
        id: testing.id,
        test_name: name,
        user: `${user.first_name} ${user.family_name}`,
        date: testing.pass_date,
        result: testing.result,
        completed: testing.completed,
      });
    }))
  );
  
  return returnedResults;
}

module.exports = searchForResult;