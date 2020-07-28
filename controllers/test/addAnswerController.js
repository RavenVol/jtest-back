const db = require('../../config/db');
const generateUniqueDBFieldString = require('../misc/generateUniqueDBFieldString');
const getOneFromTable = require('../helpers/getOneFromTable');

/**
 * This function is a part of addQuestionController (below)
 * Insert or update data for answers
 * @param {string} answer_id 
 * @param {string} question_id 
 * @param {object} answer 
 * @param {array} langs 
 * @param {boolean} isNew 
 */
const addAnswer = (answer_id, question_id, answer, langs, isNew) => {
  if (isNew) {
    db.query(`INSERT INTO answer (id, question_id, correct, a_order) VALUES ("${answer_id}", "${question_id}", "${answer.correct}", "${answer.order}")`, (error) => {
      if (error) console.warn(error);
    });
  } else {
    db.query(`UPDATE answer SET correct="${answer.correct}", a_order="${answer.order}", status="${answer.status}" WHERE id="${answer_id}"`, (error) => {
      if (error) console.warn(error);
    });
  }

  db.query(`INSERT INTO answer_text (answer_id, lang, text) VALUES ${langs.map(lang => `("${answer_id}", "${lang}", "${answer.text[lang]}")`).join(',')}`, (error) => {
    if (error) console.warn(error);
  });

  const equivalent_langs = langs.filter(lang => answer.equivalent && answer.equivalent.hasOwnProperty(lang) && answer.equivalent[lang].length > 0);
  
  if (equivalent_langs.length > 0) {
    db.query(`INSERT INTO answer_equivalent (answer_id, lang, text) VALUES ${equivalent_langs.map(lang => `("${answer_id}", "${lang}", "${answer.equivalent[lang]}")`).join(',')}`, (error) => {
      if (error) console.warn(error);
    });
  }
}

/**
 * If new answer, creates new entry in DB.answer table
 * otherwise updates entry for existing answer.
 * Creates or updates entry for answer text in DB.answer_text table
 * Creates or updates entry for answer equivalent in DB.answer_equivalent table if needed.
 * 
 * @async
 * @param {string} question_id
 * @param {string} question_type
 * @param {string} langs
 * @param {object} answer
 * @returns {void}
 */
const addAnswerController = async(question_id, question_type, langs, answer) => {
  console.log('addAnswerController');
  const answer_id = answer.id || await generateUniqueDBFieldString('answer', 'id', 16);
  
  if (answer.id) {
    //If it's looks like answer already exist
    const dbAnswer = await getOneFromTable('answer', `id="${answer_id}"`);
    if (dbAnswer.id) {
      //If answer realy exist
      //delete old data from DB.answer_text table
      const answerTextDeleted = await new Promise((res) => {
        db.query(`DELETE FROM answer_text WHERE ${langs.map(lang => `(answer_id="${answer_id}" AND lang="${lang}")`).join(' OR ')}`, (error) => {
          if (error) console.warn(error);
          res(true);
        });
      });

      let answerEquivalentDeleted = true;
      if (question_type === 'findmatch' || answer.equivalent) {
        //delete old data from DB.answer_equivalent table
        answerEquivalentDeleted = await new Promise((res) => {
          db.query(`DELETE FROM answer_equivalent WHERE ${langs.map(lang => `(answer_id="${answer_id}" AND lang="${lang}")`).join(' OR ')}`, (error) => {
            if (error) console.warn(error);
            res(true);
          });
        })
      }

      // Inserting all new data
      if (answerTextDeleted && answerEquivalentDeleted) addAnswer(answer_id, question_id, answer, langs, false);
    } else {
      // If answer does not exist indeed, create as new
      const new_answer_id = await generateUniqueDBFieldString('answer', 'id', 16);
      addAnswer(new_answer_id, question_id, answer, langs, true);
    }
  } else {
    //If it's a new answer - inserting it to DB.answer table
    addAnswer(answer_id, question_id, answer, langs, true);
  }
}

module.exports = addAnswerController;