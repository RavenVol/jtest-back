const CLIENT_URL = require('../config/configServer').CLIENT_URL;
const SERVER_URL = require('../config/configServer').SERVER_URL;

/**
 * Registration letter
 * @param {*} name 
 * @param {*} secret 
 */
const registrationEmail = (name, secret) => {
  return `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>JTest Registration Letter</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <link href="https://fonts.googleapis.com/css2?family=Nothing+You+Could+Do&display=swap" rel="stylesheet">
      <style type="text/css">
        .jtest:first-letter { color: #adff2f; }
      </style>
    </head>
    <body style="margin: 0; padding: 0;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse;">
          <tr>
            <td width="100%">
              <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#353535" style="border-collapse: collapse;">
                <tr>
                  <td width="300" height="200" align="right" style="padding-top: 20px; padding-bottom: 20px;">
                    <img src="${SERVER_URL}/api/pic/piclogo.png" alt="jTest logo" width="100%" height="100%" style="transform: rotateZ(15deg);"/>
                  </td>
                  <td width="300" height="200" align="left">
                    <a href="${CLIENT_URL}" target="_blank" style="display: inline-block; padding-left: 20px;">
                      <img src="${SERVER_URL}/api/pic/picjTest-big.png" alt="jTest" width="100%" height="100%"/>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td width="100%" style="padding-top: 20px; padding-right: 10px; padding-bottom: 20px; padding-left: 10px;">
              <p style="text-align: center;">Dear ${name}!</p>
              <p>You resceive this letter from jTest because you begin a registration process to jTest web-service.</p>
              <p>
                To complete registration just follow this link:
                <a href="${CLIENT_URL}/confirm${secret}">
                  ${CLIENT_URL}/confirm${secret}
                </a>
              </p>
              <p>If you resceived this letter accidantly just ignore it.</p>
            </td>
          </tr>

          <tr>
            <td width="100%" align="center" bgcolor="#353535" style="padding-top: 10px; padding-bottom: 10px;">
              <p style="color: #ffffff;">
                Thank you for using&nbsp;
                <a href="${CLIENT_URL}" target="_blank">
                  <img src="${SERVER_URL}/api/pic/picjTest-small.png" alt="jTest" width="100%" height="100%" />
                </a>
              </p>
            </td>
          </tr>
        </table>
      </table>
    </body>
  </html>
  `
}

module.exports = registrationEmail;