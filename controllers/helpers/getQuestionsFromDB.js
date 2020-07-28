const db = require('../../config/db');
const getRecordsFromTable = require('./getRecordsFromTable');

/**
 * Returns prepaired questions array (with texts and answers included)
 * @param {string} cond 
 * @returns array of questions
 * @async
 */
const getQuestionsFromDB = async(cond) => {
  const questions = await getRecordsFromTable('question', cond);

  // getting questions texts
  const question_texts = await getRecordsFromTable('question_text', `${questions.map(question => `question_id="${question.id}"`).join(' OR ')}`); 
  const q_texts = {};
  question_texts.forEach(entry => {
    if (!q_texts.hasOwnProperty(entry.question_id)) {
      q_texts[entry.question_id] = {};
    }
    q_texts[entry.question_id][entry.lang] = entry.text;
  });

  // getting questions answers
  const answers = await getRecordsFromTable('answer', `${questions.map(question => `question_id="${question.id}"`).join(' OR ')}`);
  
  // getting answers texts
  const answers_texts = answers[0]
    ? await getRecordsFromTable('answer_text', `${answers.map(answer => `answer_id="${answer.id}"`).join(' OR ')}`)
    : [];
  const a_texts = {};
  answers_texts[0] && answers_texts.forEach(entry => {
    if (!a_texts.hasOwnProperty(entry.answer_id)) {
      a_texts[entry.answer_id] = {}
    }
    a_texts[entry.answer_id][entry.lang] = entry.text;
  });
  
  // getting answers equivalents
  const answers_equivalents = answers[0] 
    ? await getRecordsFromTable('answer_equivalent', `${answers.map(answer => `answer_id="${answer.id}"`).join(' OR ')}`)
    : [];
  const a_equivalents = {};
  answers_equivalents[0] && answers_equivalents.forEach(entry => {
    if (!a_equivalents.hasOwnProperty(entry.answer_id)) {
      a_equivalents[entry.answer_id] = {}
    }
    a_equivalents[entry.answer_id][entry.lang] = entry.text;
  });

  // combining data for return
  const returnedAnswers = answers.map(answer => ({
    ...answer,
    text: {...a_texts[answer.id]},
    equivalent: {...a_equivalents[answer.id]},
  }));

  const returnedQuestions = questions.map(question => ({
      ...question,
      text: {...q_texts[question.id]},
      answers: returnedAnswers.filter(answer => answer.question_id === question.id),
  }));

  return returnedQuestions;
}

module.exports = getQuestionsFromDB;