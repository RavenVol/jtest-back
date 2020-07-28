const mysql = require('mysql');
const { host, database, user, password } = require('./keys').dbConnection;

const db = mysql.createConnection({
  host, // host : keys.dbConnection.host
  database, // database : keys.dbConnection.database
  user, // user : keys.dbConnection.user
  password, // password : keys.dbConnection.password
});

db.connect((error) => {
  if (error) {
    console.warn(error);
  } else {
    console.log(`Server successfully connected to ${database} DataBase`);
  }
});

module.exports = db;
