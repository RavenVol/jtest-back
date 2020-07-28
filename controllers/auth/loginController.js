const validateRegData = require('../validators/validateRegData');
const getOneFromTable = require('../helpers/getOneFromTable');
const {isHashMatch} = require('../validators/hashController');
const accessToken = require('../tokens/accessToken');
const configServer = require('../../config/configServer');

/**
 * Gets user cridentials from user-application form 
 * and if email and password match to user in DB
 * sends accessToken back to user-application
 * @param {*} req 
 * @param {*} res 
 * @returns {void}
 * @async
 */
const loginController = async(req, res) => {
  console.log('loginController');
  const userCridentials = validateRegData(JSON.parse(JSON.stringify(req.body)));

  const userMail = await getOneFromTable('emails', `mail = "${userCridentials.email}"`);
  if (!userMail.user_id) {
    return res.json({message: 'not_exist'});
  }

  const user = await getOneFromTable('self_user', `user_id="${userMail.user_id}"`);
  if (!user.user_id) {
    return res.json({message: 'wrong_provider'});
  }
  if (!isHashMatch(userCridentials.password, user.password)) {
    return res.json({message: 'wrong_credentials'});
  }

  const token = accessToken(user.user_id);
  res.json({
    message: 'OK', 
    user: {
      token,
      first_name: user.first_name,
      family_name: user.family_name,
      photo_url: `${configServer.SERVER_URL}/api/pic/avatar${user.photo_url}`,
      gender: user.gender,
      email: userMail.mail
    },
  });
}

module.exports = loginController;
