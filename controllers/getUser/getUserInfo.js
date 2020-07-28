const getOneFromTable = require('../helpers/getOneFromTable');
const getRecordsFromTable = require('../helpers/getRecordsFromTable');
const configServer = require('../../config/configServer');

/**
 * Return user info (first_name, family_name, photo_url, gender)
 * for user that has an id='id'
 * @param {string} id 
 * @returns {object}
 * @async
 */
const getUserInfo = async(id) => {
  console.log('getUserInfo');
  
  const providers = await getRecordsFromTable('providers', `user_id = "${id}"`);
  const userInfos = await Promise.all (
    providers.map(provider => new Promise((res) => {
      getOneFromTable(`${provider.name}_user`, `user_id = "${provider.provider_id}"`)
      .then(user => {
        if (provider.name === 'self') {
          user.photo_url = `${configServer.SERVER_URL}/api/pic/avatar${user.photo_url}`;
        }
        res(user);
      })
      .catch(error => res({}));
    }))
  );

  const user = {
    first_name: "",
    family_name: "",
    photo_url: "",
    gender: ""
  };

  userInfos.forEach(info => {
    user.first_name = info.first_name || user.first_name;
    user.family_name = info.family_name || user.family_name;
    user.photo_url = info.photo_url || user.photo_url;
    user.gender = info.gender || user.gender;
  });

  return user;
}

module.exports = getUserInfo;