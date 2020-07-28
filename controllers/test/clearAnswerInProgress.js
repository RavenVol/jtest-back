const db = require('../../config/db');

/**
 * Delete all expired entries in DB.answer_in_progress table 
 * and move them to appropreate answers tables
 */
const clearAnswerInProgress = () => {
  const clear_answer_in_progress = setInterval(() => {
    db.query(`SELECT * FROM answer_in_progress WHERE expired<NOW()`, (error, outdatedAnswers) => {
      if (error) console.warn(error);

      if (outdatedAnswers[0]) {
        const examinationAnswers = outdatedAnswers.filter(answer => answer.test_type === 'examination');
        const educationAnswers = outdatedAnswers.filter(answer => answer.test_type === 'education');

        if (examinationAnswers.length > 0) {
          db.query(`INSERT INTO examination_answer (testing_id, question_id, answer_id, user_answer) 
          VALUES ${examinationAnswers.map(answer => `("${answer.testing_id}", "${answer.question_id}", "${answer.answer_id}", "${answer.user_answer}")`)
          .join(',')}`, (error, result) => {
            if (error) console.warn(error);
          });
        }

        if (educationAnswers.length > 0) {
          db.query(`INSERT INTO education_answer (testing_id, question_id, answer_id, user_answer) 
          VALUES ${educationAnswers.map(answer => `("${answer.testing_id}", "${answer.question_id}", "${answer.answer_id}", "${answer.user_answer}")`)
          .join(',')}`, (error, result) => {
            if (error) console.warn(error);
          });
        }

        db.query(`DELETE FROM answer_in_progress WHERE ${outdatedAnswers.map(answer => `id="${answer.id}"`).join(' OR ')}`);
      }
    });
  }, 5000);
}

module.exports = clearAnswerInProgress;