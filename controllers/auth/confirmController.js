const getOneFromTable = require('../helpers/getOneFromTable');
const addUserToDB = require('../addUser/addUserToDB');
const saveUserAvatar = require('../addUser/saveUserAvatar');
const deleteFromTable = require('../delete/deleteFromTable');

/**
 * If "secret" from confirmition link (from email letter)
 * matches the same in 'unregistered_user' table's record,
 * Creates propper user in 'self-user' DB table 
 * from 'unregistered_user' DB table 
 * and sends accessToken back to user application.
 * @param {*} req 
 * @param {*} res 
 * @returns {void}
 * @async
 */
const confirmController = async(req, res) => {
  console.log('confirmController');
  const secret = JSON.parse(JSON.stringify(req.body)).secret;

  if (!secret || typeof(secret) !== 'string' || secret.length !== 32) {
    return res.json({message: 'Bad'});
  }

  const unregistered_user = await getOneFromTable('unregistered_user', `secret="${secret}"`);
  if (!unregistered_user.secret) {
    return res.json({message: 'Expired'});
  }

  const user = {
    ...unregistered_user, 
    emails: [{value: unregistered_user.email}]
  };
  const addedUser = await addUserToDB('self', user);
  saveUserAvatar(user.photo, addedUser.photo_url);
  deleteFromTable(`unregistered_user`, `secret="${user.secret}"`);
  res.json({message: 'OK', token : addedUser.token});
}

module.exports = confirmController;