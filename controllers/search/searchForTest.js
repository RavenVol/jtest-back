const getRecordsFromTable = require('../helpers/getRecordsFromTable');
const getUserInfo = require('../getUser/getUserInfo');

const createQuery = (tests_byname_strong_ids, tests_byname_weak_ids, tests_byid_strong_ids) => {
  let query = '';
  if (tests_byname_strong_ids.length > 0) {
    query += tests_byname_strong_ids.map(id => `id = "${id}"`).join(' OR ');
    query += ' OR ';
  }

  if (tests_byname_weak_ids.length > 0) {
    query += tests_byname_weak_ids.map(id => `id = "${id}"`).join(' OR ');
    query += ' OR ';
  }

  if (tests_byid_strong_ids.length > 0) {
    query += tests_byid_strong_ids.map(id => `id = "${id}"`).join(' OR ');
  } else {
    query = query.length > 0 && query.slice(0, query.length-4);
  }

  return query;
}

/**
 * Searching tests in DB with ID or test name that fits search string
 * @async
 * @param {array} search
 * @returns {array} tests
 */
const searchForTest = async(search) => {
  console.log('searchForTest');

  let returnedTests = [];
  const tests_byname_strong = await getRecordsFromTable("test_name",  `${search.map(word => `text LIKE "%${word.toLowerCase()}%"`).join(' AND ')}`);
  const tests_byname_weak = await getRecordsFromTable("test_name",  `${search.map(word => `text LIKE "%${word.toLowerCase()}%"`).join(' OR ')}`);
  const tests_byname_strong_ids = Array.from(new Set(tests_byname_strong.map(test => test.test_id)));
  const tests_byname_weak_ids = Array.from(new Set(tests_byname_weak.map(test => test.test_id))).filter(id => !tests_byname_strong_ids.includes(id));
  
  const tests_byid_strong = await getRecordsFromTable('test', `${search.map(word => `id LIKE "%${word.toLowerCase()}%"`).join(' AND ')}`);
  const tests_byid_strong_ids = Array.from(new Set(tests_byid_strong.map(test => test.id))).filter(id => !tests_byname_strong_ids.includes(id));

  if (tests_byname_strong_ids.length > 0 || tests_byname_weak_ids.length > 0 || tests_byid_strong_ids.length > 0) {
    const tests = await getRecordsFromTable('test', createQuery(tests_byname_strong_ids, tests_byname_weak_ids, tests_byid_strong_ids));
    const tests_names = await getRecordsFromTable('test_name', `${tests.map(test => `(test_id = "${test.id}")`).join(' OR ')}`);
    
    const unsortedTests = await Promise.all (
      tests.map(test => new Promise (async(res, rej) => {
        const name = {};
        tests_names.filter(test_name => test_name.test_id === test.id).forEach(test_name => name[test_name.lang] = test_name.text);
        const author = await getUserInfo(test.user_id);
        res ({
          id: test.id,
          test_name: name,
          type: test.type,
          author: `${author.first_name} ${author.family_name}`,
        });
      }))
    );

    if (unsortedTests.length > 0 && tests_byid_strong_ids.length > 0) {
      returnedTests = returnedTests.concat(unsortedTests.filter(test => tests_byid_strong_ids.includes(test.id)));
    }
    if (unsortedTests.length > 0 && tests_byname_strong_ids.length > 0) {
      returnedTests = returnedTests.concat(unsortedTests.filter(test => tests_byname_strong_ids.includes(test.id)));
    }
    if (unsortedTests.length > 0 && tests_byname_weak_ids.length > 0) {
      returnedTests = returnedTests.concat(unsortedTests.filter(test => tests_byname_weak_ids.includes(test.id)));
    }
  }
  
  return returnedTests;
}

module.exports = searchForTest;