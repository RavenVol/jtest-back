const nodemailer = require('nodemailer');
const keys = require('../../config/keys');
/**
 * Sends email
 * @param {object} letter 
 * @returns {void}
 */
const sendEmail = (letter) => {
  console.log('sendEmail');
  const transporter = nodemailer.createTransport({
    service: keys.mailer.service,
    auth: {
      user: keys.mailer.user,
      pass: keys.mailer.pass
    }
  });

  transporter.sendMail(letter, (error, result) => {
    if (error) {
      console.warn(error);
    } else {
      console.log(`Message was sent successfuly: ${result}`);
    }
  });
}

module.exports = sendEmail;
