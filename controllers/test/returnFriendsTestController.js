const JWT = require('jsonwebtoken');
const { secret } = require('../../config/keys').jwt;
const allowedProviders = require('../../config/providers-cfg').allowedProviders;

const getRecordsFromTable = require('../helpers/getRecordsFromTable');
const isUserExist = require('../testingDBData/isUserExist');

const returnFriendsTestController = async(req, res) => {
  console.log('returnFriendsTestController');
  const token = JSON.parse(JSON.stringify(req.body)).token;

  // Validation
  if (!token || typeof(token) !== 'string') return res.json({message : 'unknown_user'});

  // Getting user id
  const user_id = JWT.verify(token, secret).sub;
  if (!user_id || typeof(user_id) !== 'string' || user_id.length !== 16) {
    return res.json({message : 'unknown_user'});
  }

  // Getting user e-mails
  const emails = await getRecordsFromTable('emails', `user_id = "${user_id}"`);
  if (emails.length === 0) return res.json({message : 'unknown_user'});

  // What tests user can change
  const test_allowed = await getRecordsFromTable('test_allowed_user', `${emails.map(email => `user_email="${email.mail}"`).join(' OR ')}`);
  if (test_allowed.length === 0) return res.json({message : 'no_tests'});
  const test_ids = Array.from(new Set(test_allowed.map(test => test.test_id)));

  // Getting test data
  const tests = await getRecordsFromTable('test', `${test_ids.map(id => `(id="${id}" AND edit_rights="selected" AND user_id<>"${user_id}")`).join(' OR ')}`);
  if (tests.length === 0) return res.json({message : 'no_tests'});
  const test_names = await getRecordsFromTable('test_name', `${tests.map(test => `test_id="${test.id}"`).join(' OR ')}`);

  // Getting test authors
  const authors_ids = Array.from(new Set(tests.map(test => test.user_id)));
  const providers = await getRecordsFromTable('providers', `${authors_ids.map(id => `user_id = "${id}"`).join(' OR ')}`);

  const infos = [...await Promise.all(
    allowedProviders.map(provider => new Promise(res => {
      getRecordsFromTable(`${provider}_user`, `${providers.filter(entry => entry.name === provider).map(entry => `user_id = "${entry.provider_id}"`).join(' OR ')}`)
      .then(info => res(info));
    }))
  )].flat();

  // prepearing data for response
  tests.forEach(test => {
    test.name = {};
    test_names.filter(test_name => test_name.test_id === test.id)
    .forEach(test_name => test.name[test_name.lang] = test_name.text);

    const author_name = {first_name : '', family_name : ''};
    providers.filter(provider => provider.user_id === test.user_id)
    .map(provider => infos.filter(info => info.user_id === provider.provider_id)[0])
    .forEach(info => {
      author_name.first_name = info.first_name || author_name.first_name;
      author_name.family_name = info.family_name || author_name.family_name;
    });

    test.author = `${author_name.first_name} ${author_name.family_name}`;
  });

  res.json({message : 'OK', tests : tests});
}

module.exports = returnFriendsTestController;