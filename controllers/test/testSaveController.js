const db = require('../../config/db');
const JWT = require('jsonwebtoken');
const { secret } = require('../../config/keys').jwt;

const isUserExist = require('../testingDBData/isUserExist');
const validateTest = require('../validators/validateTest');
const getOneFromTable = require('../helpers/getOneFromTable');
const addQuestionController = require('./addQuestionController');

const generateUniqueDBFieldString = require('../misc/generateUniqueDBFieldString');

/**
 * Getting data from user application, validates data and add data to appropriate DB tables
 * @param {*} req 
 * @param {*} res 
 */
const testSaveController = async(req, res) => {
  console.log('testSaveController');
  const body = JSON.parse(JSON.stringify(req.body));
  const token = body.token;
  const test = JSON.parse(body.test);

  let user_id = '';
  if (token && typeof(token) === 'string') {
    user_id = JWT.verify(body.token, secret).sub;
  } else {
    return res.json({ message: 'no_user' });
  }

  if (!user_id || typeof(user_id) !== 'string' || user_id.length !== 16) {
    return res.json({message: 'wrong_user'});
  }

  const userExist = await isUserExist(user_id, 'users');
  if (!userExist) {
    return res.json({message: 'unknown_user'});
  }

  if (!validateTest(test)) {
    return res.json({message: 'wrong_data'});
  }

  const test_id = test.id || await generateUniqueDBFieldString('test', 'id', 16);
  if (test.id) {
    //If it looks like test already exist
    const dbTest = await getOneFromTable('test', `id = "${test_id}"`);
    if (dbTest.id) {
      //If test realy exists
      //Updating DB.test table with new data
      db.query(`UPDATE test SET question_qtty="${test.question_qtty}", retry="${test.retry}", edit_rights="${test.edit_rights}", category="${test.category || 0}", type="${test.type}", status="edit", color="${test.color}", questions_order="${test.questions_order}" WHERE id="${test_id}"`, (error) => {
        if (error) console.warn(error);
      });

      //Updating DB.test_lang table with new data. (deleting old data and inserting new)
      db.query(`DELETE FROM test_lang WHERE test_id="${test_id}"`, (error) => {
        if (error) console.warn(error);
        db.query(`INSERT INTO test_lang (test_id, lang) VALUES ${test.langs.map(lang => `("${test_id}", "${lang}")`).join(',')}`, (error) => {
          if (error) console.warn(error);
        });
      });

      //Updating DB.test_name table with new data. (deleting old data and inserting new)
      db.query(`DELETE FROM test_name WHERE test_id="${test_id}"`, (error) => {
        if (error) console.warn(error);
        db.query(`INSERT INTO test_name (test_id, lang, text) VALUES ${test.langs.map(lang => `("${test_id}", "${lang}", "${test.testName[lang]}")`).join(',')}`, (error) => {
          if (error) console.warn(error);
        });
      });

      //Updating DB.test_allowed_user table with new data. (deleting old data and inserting new)
      db.query(`DELETE FROM test_allowed_user WHERE test_id="${test_id}"`, (error) => {
        if (error) console.warn(error);
        if (test.testEditUsers.length > 0) {
          db.query(`INSERT INTO test_allowed_user (test_id, user_email) VALUES ${test.testEditUsers.map(email => `("${test_id}", "${email}")`).join(',')}`, (error) => {
            if (error) console.warn(error);
          })
        }
      })
      
      const questionsDeleted = await new Promise((res) => {
        db.query(`UPDATE question SET status="deleted" WHERE test_id="${test_id}"`, (error) => {
          if (error) {
            console.warn(error);
            res(false);
          }
          res(true);
        })
      });
      if (questionsDeleted && test.questions.length > 0) {
        test.questions.forEach(question => addQuestionController(test_id, user_id, question, test.langs));
      }

      res.json({ message: 'OK' });

    } else {
      //If test does not exist indeed
      return res.json({message: 'unknown_test'});
    }
  } else {
    // If it's a new test - adding it to appropriate DB tables
    const color = test.color || Math.round(Math.random() * 9);
    db.query(`INSERT INTO test (id, user_id, question_qtty, retry, edit_rights, category, type, status, color, questions_order) VALUES ("${test_id}", "${user_id}", "${test.question_qtty}", "${test.retry}", "${test.edit_rights}", "${test.category || 0}", "${test.type}", "${test.status}", "${color}", "${test.questions_order}")`, (error, result) => {
      if (error) console.warn(error);
    });
    
    db.query(`INSERT INTO test_lang (test_id, lang) VALUES ${test.langs.map(lang => `("${test_id}", "${lang}")`).join(',')}`, (error, result) => {
      if (error) console.warn(error);
    });
    
    db.query(`INSERT INTO test_name (test_id, lang, text) VALUES ${test.langs.map(lang => `("${test_id}", "${lang}", "${test.testName[lang]}")`).join(',')}`, (error, result) => {
      if (error) console.warn(error);
    });
    
    if (test.testEditUsers.length > 0) {
      db.query(`INSERT INTO test_allowed_user (test_id, user_email) VALUES ${test.testEditUsers.map(email => `("${test_id}", "${email}")`).join(',')}`, (error, result) => {
        if (error) console.warn(error);
      });
    }

    if (test.questions.length > 0) {
      test.questions.forEach(question => addQuestionController(test_id, user_id, question, test.langs));
    }

    res.json({ message: 'OK' });
  }
}

module.exports = testSaveController;