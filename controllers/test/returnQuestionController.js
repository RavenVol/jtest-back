const db = require('../../config/db');
const JWT = require('jsonwebtoken');
const { secret } = require('../../config/keys').jwt;

const getOneFromTable = require('../helpers/getOneFromTable');
const getRecordsFromTable = require('../helpers/getRecordsFromTable');
const getUserInfo = require('../getUser/getUserInfo');

const returnQuestionController = async(req, res) => {
  console.log('returnQuestionController');
  const body = JSON.parse(JSON.stringify(req.body));
  const { token, testing_id, lang, q_number } = body;

  const user_id = JWT.verify(token, secret).sub;

  if (!user_id || !testing_id || !lang || !q_number) {
    console.warn('Wrong Parametr');
    return res.status(403).json({status: 403, message: 'Wrong Parameter'});
  }

  const userExist = await new Promise((resolve, reject) => {
    db.query(`SELECT * FROM testing WHERE id="${testing_id}" AND user_id="${user_id}" AND completed="false"`, (error, result) => {
      if (error) console.warn(error);
      
      if (result[0]) resolve(true);

      resolve(false);
    });
  });

  const test_id = await new Promise((resolve, reject) => {
    db.query(`SELECT test_id FROM testing WHERE id="${testing_id}"`, (error, result) => {
      if (error) console.warn(error);

      if (result[0]) resolve(result[0].test_id);

      resolve(false);
    });
  });

  const test_type = await new Promise((resolve, reject) => {
    db.query(`SELECT type FROM test WHERE id="${test_id}"`, (error, result) => {
      if (error) console.warn(error);

      if (result[0]) {
        resolve(result[0].type);
      }
    });
  });

  let langExist = false;
  if (test_id) {
    langExist = await new Promise((resolve, reject) => {
      db.query(`SELECT * FROM test_lang WHERE test_id="${test_id}" AND lang="${lang}"`, (error, result) => {
        if (error) console.warn(error);

        if (result[0]) resolve(true);

        resolve(false);
      });
    });
  }

  if (userExist && test_id && langExist) {
    const question_id_cm = await new Promise((resolve, reject) => {
      db.query(`SELECT * FROM testing_questions WHERE testing_id="${testing_id}"`, (error, result) => {
        if (error) console.warn(error);

        if (result[0]) {
          const questions_left = result[0].questions_left.split(',');

          const questions_pass = result[0].questions_pass 
            ? result[0].questions_pass.split(',') 
            : [];

          if (questions_left[q_number] && !questions_pass.includes(questions_left[q_number])) {
            questions_pass.push(questions_left[q_number]);
            const completed = questions_left.map(question => !questions_pass.includes(question));
            db.query(`UPDATE testing_questions SET questions_pass="${questions_pass.join(',')}" WHERE testing_id="${testing_id}"`, (error, result) => {
              if (error) {
                console.warn(error);
              } else {
                resolve({id: questions_left[q_number], completed});
              }
              resolve(false);
            });
          }
        } else {
          resolve(false);
        }
      });
    });

    if (question_id_cm.id) {
      const question = await new Promise((resolve, reject) => {
        db.query(`SELECT * FROM question WHERE id="${question_id_cm.id}"`, async(error, question) => {
          if (error) console.warn(error);

          if (question[0]) {
            const author = await getUserInfo(question[0].user_id);
            resolve({
              id: question_id_cm.id,
              completed: question_id_cm.completed,
              text: '',
              author: `${author.first_name} ${author.family_name}`,
              photo_url: author.photo_url,
              type: question[0].type,
              timeout: question[0].timeout,
              answer_type: question[0].answer_type,
              answers: [''],
            });
          }
          resolve(false);
        })
      });

      if (question) {
        question.text = await new Promise((resolve, reject) => {
          db.query(`SELECT text FROM question_text WHERE question_id="${question.id}" AND lang="${lang}"`, (error, result) => {
            if (error) console.warn(error);

            if (result[0]) resolve(result[0].text);

            resolve(false);
          })
        });
      
        if (question.type !== 'freeanswer') {
          question.answers = await new Promise((resolve, reject) => {
            db.query(`SELECT id FROM answer WHERE question_id="${question.id}" AND status="published"`, async(error, answers) => {
              if (error) console.warn(error);

              if(answers[0]) {
                const allAnswers = await Promise.all(
                  answers.map((answer, index) => new Promise(async(resolve, reject) => {
                    
                    const text = await new Promise((resolve,reject) => {
                      db.query(`SELECT text FROM answer_text WHERE answer_id="${answer.id}" AND lang="${lang}"`, (error, answer_text) => {
                        if (error) console.warn(error);

                        if (answer_text[0]) resolve(answer_text[0].text);

                        resolve('');
                      });
                    });

                    let equivalent = '';
                    if (question.type === 'findmatch') {
                      equivalent = await new Promise((resolve,reject) => {
                        db.query(`SELECT text FROM answer_equivalent WHERE answer_id="${answer.id}" AND lang="${lang}"`, (error, equivalent) => {
                          if (error) console.warn(error);

                          if (equivalent[0]) resolve({id: answer.id, text: equivalent[0].text});

                          resolve('');
                        });
                      });
                    }

                    resolve({
                      id: answer.id,
                      correct: false,
                      order: 1,
                      text,
                      equivalent,
                    });
                  }))
                );

                resolve(allAnswers);
              }

              resolve(false);
            });
          });

          question.answers.sort((a, b) => Math.random() - 0.5);
          question.answers.forEach((answer, index) => question.answers[index].order = index + 1);
        }

        if (question.type === 'findmatch') {
          const unusedEquivalents = question.answers.map(answer => answer.equivalent);
          
          const newAnswers = question.answers.map(answer => ({
            ...answer,
            equivalent: {id: '', text: ''}
          }));
          
          question.answers = newAnswers;
          question.unusedEquivalents = [...unusedEquivalents.sort((a, b) => Math.random() - 0.5)];
        }

        db.query(`INSERT INTO answer_in_progress (testing_id, test_type, question_id, answer_id, user_answer, expired) VALUES ${question.type === 'freeanswer'
          ? `("${testing_id}", "${test_type}", "${question.id}", "freeanswer_no_id", "${null}", DATE_ADD(NOW(), INTERVAL ${test_type === 'social' ? question.timeout + 86400 : question.timeout + 5} SECOND))`
          : question.answers.map(answer => {
              let user_answer = answer.correct;
              if (question.type === 'setorder') user_answer = answer.order;
              if (question.type === 'findmatch') user_answer = answer.equivalent.id;
              
              return (
                `("${testing_id}", "${test_type}", "${question.id}", "${answer.id}", "${user_answer}", DATE_ADD(NOW(), INTERVAL ${test_type === 'social' ? question.timeout + 86400 : question.timeout + 5} SECOND))`
              )
            }).join(',')
        }`, (error, result) => {
          if (error) console.warn(error);
        });

        res.json({ message: 'OK', question, test_type });
      }
    } else {
      res.json({ message: 'No question found'});
    }
  } else {
    res.json({ message: 'Forbidden for this user'});
  }
}

module.exports = returnQuestionController;