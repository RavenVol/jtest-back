const validateRegData = require('../validators/validateRegData');
const saveUserAvatar = require('../addUser/saveUserAvatar');
const {createHash} = require('../validators/hashController');
const addUnregisteredUserToDB = require('../addUser/addUnregisteredUserToDB');
const registrationEmail = require('../../views/registrationEmail');
const sendEmail = require('../mail/sendEmail');

/**
 * Gets credentials from user-application form,
 * Creates record in 'unregistered_user' DB table
 * and sends confirmition email to user
 * @param {*} req 
 * @param {*} res 
 * @returns {void}
 */
const registerController = (req, res) => {
  console.log('registerController');
  const user = validateRegData(JSON.parse(JSON.stringify(req.body)));
  
  user.photo = req.files[0]
    ? saveUserAvatar(req.files[0].filename, req.files[0].filename, req.files[0].mimetype)
    : '';

  let {email, password, first_name, family_name, gender, photo} = user;

  if (email, password, first_name) {
    user.password = createHash(user.password);

    addUnregisteredUserToDB(user).then(secret => {
      const letter = registrationEmail(user.first_name, secret);
      sendEmail({
        from: 'r.volianiuk@gmail.com',
        to: user.email,
        subject: 'JTest: Complete your registration',
        html: letter
      });
      res.json({message: 'OK'});
    });
  } else {
    const error = [];
    !email && error.push('email');
    !password && error.push('password');
    !first_name && error.push('first_name');
    !family_name && error.push('family_name');
    !gender && error.push('gender');
    !photo && error.push('photo');
    
    res.json({message: 'error', error: error});
    console.warn('Required fields are empty');
  }
}

module.exports = registerController;