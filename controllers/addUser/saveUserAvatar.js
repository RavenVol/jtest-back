const fs = require('fs');

/**
 * Renames user photo image file
 * @param {string} oldName 
 * @param {string} newName 
 * @param {string} mime 
 * @returns {string} new photo image name
 */
const saveUserAvatar = (oldName, newName, mime) => {
  console.log('saveUserAvatar');
  let avatarName = '';
  if ( mime === 'image/png' 
    || mime === 'image/jpeg' 
    || mime === 'image/gif'
    || mime === 'png'
    || mime === 'jpeg'
    || mime === 'jpg'
    || mime === 'gif'
  ) {
    avatarName = `${newName}.${mime.replace('image/', '')}`;
    fs.renameSync(`images/avatar/${oldName}`, `images/avatar/${avatarName}`);
  } else if (!mime) {
    avatarName = newName;
    fs.renameSync(`images/avatar/${oldName}`, `images/avatar/${avatarName}`);
  } else {
    fs.unlinkSync(`images/avatar/${oldName}`);
  }

  return avatarName;
}

module.exports = saveUserAvatar;