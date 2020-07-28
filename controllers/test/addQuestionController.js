const db = require('../../config/db');
const generateUniqueDBFieldString = require('../misc/generateUniqueDBFieldString');
const getOneFromTable = require('../helpers/getOneFromTable');
const getRecordsFromTable = require('../helpers/getRecordsFromTable');
const addAnswerController = require('./addAnswerController');

/**
 * This function is a part of addQuestionController (below)
 * Crete new entry in DB.question table for a new question
 * OR update existing entry in DB.question table for existing question.
 * Insert new records to DB.question_text table.
 * Insert answers as new
 * @param {string} question_id 
 * @param {string} test_id 
 * @param {string} user_id 
 * @param {object} question 
 * @param {array} langs 
 * @param {boolean} isNew 
 */
const addQuestion = (question_id, test_id, user_id, question, langs, isNew) => {
  if (isNew) {
    //Inserting new question to DB.question table
    db.query(`INSERT INTO question (id, test_id, user_id, name, price, type, timeout, answer_type, position) VALUES ("${question_id}", "${test_id}", "${user_id}", "${question.name}", "${question.price}", "${question.type}", "${question.timeout}", "${question.answersType}", "${question.position}")`, (error) => {
      if (error) console.warn(error);
    });
  } else {
    //Updating DB.question table with new data
    db.query(`UPDATE question SET name="${question.name}", price="${question.price}", type="${question.type}", timeout="${question.timeout}", answer_type="${question.answersType}", status="${question.status}", position="${question.position}" WHERE id="${question_id}"`, (error) => {
      if (error) console.warn(error);
    });
  }
  
  //Inserting question's texts in all languages to DB.question_text table
  db.query(`INSERT INTO question_text (question_id, lang, text) VALUES ${langs.map(lang => `("${question_id}", "${lang}", "${question.text[lang]}")`).join(',')}`, (error) => {
    if (error) console.warn(error);
  });

  //If there are answers for this question - adding every answer to DB
  if (question.answers.length > 0) {
    question.answers.forEach(answer => addAnswerController(question_id, question.type, langs, answer));
  }
}


/**
 * Updates entry in DB.question table if question exist and user owns this question.
 * Does nothing if question entry exist in DB.question table but user isn't owner of question.
 * Otherwise adds new entry to DB.question table for a new question
 * @param {string} test_id 
 * @param {string} user_id 
 * @param {object} question 
 * @param {array} langs 
 * @returns {void}
 */
const addQuestionController = async(test_id, user_id, question, langs) => {
  console.log('addQuestionController');
  const question_id = question.id || await generateUniqueDBFieldString('question', 'id', 16);

  if (question.id) {
    //If it's looks like question already exist
    const dbQuestion = await getOneFromTable('question', `id="${question_id}"`);
    if (dbQuestion.id) {
      //If question realy exist

      if (dbQuestion.user_id === user_id) {
        // If user is owner of the question
        const questionTextDeleted = await new Promise((res) => {
          db.query(`DELETE FROM question_text WHERE ${langs.map(lang => `(question_id="${question_id}" AND lang="${lang}")`).join(' OR ')}`, (error) => {
            if (error) console.warn(error);
            res(true);
          })
        })
        
        //If there are answers for this question - clear all answers, that are to change
        const question_answers = await getRecordsFromTable('answer', `question_id="${question.id}"`);
        let answersDeleted = true;
        if (question.type === 'freeanswer') {
          if (question_answers.length > 0) {
            answersDeleted = await new Promise((res) => {
              db.query(`DELETE answer, answer_text, answer_equivalent FROM answer LEFT JOIN answer_text ON answer.id=answer_text.answer_id LEFT JOIN answer_equivalent ON answer.id=answer_equivalent.answer_id WHERE ${question_answers.map(answer => `answer.id="${answer.id}"`).join(' OR ')}`, (error) => {
                if (error) console.warn(error);
                res(true);
              });
            });
          }
        } else {
          answersDeleted = await new Promise((res) => {
            db.query(`UPDATE answer SET status='deleted' WHERE question_id='${question.id}'`, (error) => {
              if (error) console.warn(error);
              res(true);
            });
          });
        }

        // When every old data deleted, add new data
        if (questionTextDeleted && answersDeleted) addQuestion(question_id, test_id, user_id, question, langs, false);
      }
      // If user is not owner of this question - do nothing
    } else {
      // If question does not exist indeed, add it as new
      const new_question_id = await generateUniqueDBFieldString('question', 'id', 16);
      addQuestion(new_question_id, test_id, user_id, question, langs, true);
    }
  } else {
    // If it's a new question
    addQuestion(question_id, test_id, user_id, question, langs, true);
  }
}

module.exports = addQuestionController;