const db = require('../../config/db');
const JWT = require('jsonwebtoken');
const { secret } = require('../../config/keys').jwt;

const validateUserAnswer = require('../validators/validateUserAnswer');

const saveUserAnswerController = async(req, res) => {
  console.log('saveUserAnswerController');
  const body = JSON.parse(JSON.stringify(req.body));
  body.question = JSON.parse(body.question);
  
  if (validateUserAnswer(body)) {
    const {token, testing_id, question} = body;
    const user_id = JWT.verify(token, secret).sub;
    
    db.query(`SELECT * from testing WHERE id="${testing_id}" AND user_id="${user_id}" AND completed="false"`, (error,result) => {
      if (error) console.warn(error);

      if (!result[0]) {
        res.json({message: 'Wrong testing ID or testing was completed!'});
      } else {
        const test_id = result[0].test_id;
        db.query(`SELECT * from answer_in_progress WHERE testing_id="${testing_id}" AND question_id="${question.id}"`, (error, answersInProgress) => {
          if (error) console.warn(error);
          if (!answersInProgress[0]) {
            res.json({message: 'Answer timed out.'});
          } else {
            const test_type = answersInProgress[0].test_type;
            const userAnswers = answersInProgress.map(answer => {
              let userAnswer = null;

              switch (question.type) {
                case 'freeanswer' :
                  userAnswer = question.answers[0];
                  break;
                case 'setorder' :
                  userAnswer = question.answers.filter(ans => ans.id === answer.answer_id)[0].order;
                  break;
                case 'findmatch' :
                  userAnswer = question.answers.filter(ans => ans.id === answer.answer_id)[0].equivalent;
                  break;
                default :
                  userAnswer = question.answers.filter(ans => ans.id === answer.answer_id)[0].correct;
                  break;
              }

              return ({
                id: answer.id,
                testing_id: answer.testing_id,
                question_id: answer.question_id,
                answer_id: answer.answer_id,
                user_answer: userAnswer,
              });
            });

            db.query(`INSERT INTO ${test_type}_answer (testing_id, ${test_type === 'social' ? 'test_id,' : ''} question_id, answer_id, user_answer)
            VALUES ${userAnswers.map(answer => `(${test_type === 'social' ? `"${answer.testing_id}@", "${test_id}"`: `"${answer.testing_id}"`}, "${answer.question_id}", "${answer.answer_id}", "${answer.user_answer}")`).join(',')}`, (error, result) => {
              if (error) {
                console.warn(error);
              } else (
                db.query(`DELETE FROM answer_in_progress WHERE ${userAnswers.map(answer => `id="${answer.id}"`).join(' OR ')}`, (error, result) => {
                  if (error) {
                    console.warn(error);
                  } else {
                    res.json({message: 'OK'});
                  }
                })
              )
            });
          }
        });
      }
    });
  }
}

module.exports = saveUserAnswerController;