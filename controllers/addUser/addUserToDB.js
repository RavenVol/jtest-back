const db = require('../../config/db');

const isUserExist = require('../testingDBData/isUserExist');
const filterExistingEmails = require('./filterExistingEmails');
const createNewUser = require('./createNewUser');
const addEmailToDB = require('./addEmailToDB');
const addProviderEntry = require('./addProviderEntry');
const accessToken = require('../tokens/accessToken');
const getUserFromDB = require('../getUser/getUserFromDB');

/**
 * Add user data to all appropreate tables in DB
 * @param {string} provider 
 * @param {object} user
 * @returns {object} createdUser
 * @async
 */
const addUserToDB = async(provider, user) => {
  console.log('addUserToDB');
  const profile = {...user};
  
  // Deviding existing and new emails
  const [existingEmails, newEmails] = await filterExistingEmails(profile.emails);
  
  // Getting correct user ID and creating new user in DB
  let user_id = '';

  if (existingEmails.length === 0) {
    user_id = await createNewUser();
  } else if (existingEmails.every(email => email.user_id === existingEmails[0].user_id)) {
    user_id = existingEmails[0].user_id;
  } else {
    console.warn(`Critical Error in emails table: two or more different users has same email`);
    console.warn(existingEmails);
    user_id = existingEmails[0].user_id;
  }

  // Adding newEmails to DB
  newEmails.forEach(email => {
    addEmailToDB(email, user_id);
  });

  switch (provider) {
    case 'self' :
      profile.id = user_id;
      profile.photos = [{value : `${user_id}.${profile.photo.substr(profile.photo.lastIndexOf('.')+1)}`}];
      break;
    case 'google' :
      profile.first_name = profile.name.givenName;
      profile.family_name = profile.name.familyName
      profile.gender = '';
      break;
    defautl : break;
  }
  // Adding entry to DB "providers" table
  addProviderEntry(provider, user_id, profile.id);

  // If user received from provider exist in appropriate table - updating it's info
  // If not - creating new user in appropreate table
  const userExist = await isUserExist(profile.id, `${provider}_user`);

  if (userExist) {
    db.query(`UPDATE ${provider}_user 
      SET first_name = "${profile.first_name}", 
          family_name = "${profile.family_name}", 
          gender = "${profile.gender}",
          photo_url = "${profile.photos[0].value}"
          ${ provider === 'self' 
            ? `, password = "${profile.password}"` 
            : ''
          }
      WHERE user_id = "${profile.id}"`, 
    (error, result) => {
      if (error) console.warn(`Error while updating data for user ${profile.id} in ${provider}_user: ${error}`);
    });
  } else {
    db.query(`INSERT INTO ${provider}_user 
    (user_id, ${ provider === 'self' ? "password," : "" } first_name, family_name, photo_url, gender) 
    VALUES ("${profile.id}", ${provider === 'self' ? `"${profile.password}",` : ""} "${profile.first_name}", "${profile.family_name}", "${profile.photos[0].value}", "${profile.gender}")`, 
    (error, result) => {
      if (error) console.warn(`Insert into ${provider}_user fail: ${error}`);
    });
  }

  // Creating accessToken
  const token = accessToken(user_id);

  // get all user info from DB
  const userInfo = await getUserFromDB(user_id);

  const createdUser = {
    id: user_id,
    token,
    emails: userInfo.emails,
    first_name: profile.first_name,
    family_name: profile.family_name,
    gender: userInfo.gender,
    photo_url: profile.photos[0].value
  }

  return createdUser;
}

module.exports = addUserToDB;