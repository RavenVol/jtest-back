const {questionTypeTypes, answersTypes} = require('../../config/test-cfg');

const validateUserAnswer = (answer) => {
  console.log('validateUserAnswer');
  if (typeof(answer) !== 'object') {
    return false;
  }

  if ( !answer.hasOwnProperty('token')
    || !answer.hasOwnProperty('testing_id')
    || !answer.hasOwnProperty('question')
  ) {
    return false;
  }

  if ( typeof(answer.token) !== 'string'
    || typeof(answer.testing_id) !== 'string'
    || typeof(answer.question) !== 'object'
  ) {
    return false;
  }

  if ( answer.testing_id.length !== 16 ) {
    return false;
  }

  if ( !answer.question.hasOwnProperty('id') 
    || !answer.question.hasOwnProperty('type')
    || !answer.question.hasOwnProperty('answer_type')
    || !answer.question.hasOwnProperty('answers')
  ) {
    return false;
  }

  if ( typeof(answer.question.id) !== 'string'
    || typeof(answer.question.type) !== 'string'
    || typeof(answer.question.answer_type) !== 'string'
    || typeof(answer.question.answers) !== 'object'
  ) {
    return false;
  }

  if (answer.question.id.length !== 16) {
    return false;
  }

  if ( !questionTypeTypes.includes(answer.question.type) 
    || !answersTypes.includes(answer.question.answer_type)
  ) {
    return false;
  }

  for (let i = 0; i < answer.question.answers.length; i++) {
    let userAnswer = answer.question.answers[i];
    
    if (answer.question.type === 'freeanswer') {
      if (typeof(userAnswer) !== 'string') {
        return false;
      } 
    } else {
      if ( !userAnswer.hasOwnProperty('id')
        || !userAnswer.hasOwnProperty('correct')
        || !userAnswer.hasOwnProperty('order')
      ) {
        return false;
      }

      if ( typeof(userAnswer.id) !== 'string' 
        || typeof(userAnswer.correct) !== 'boolean'
        || typeof(userAnswer.order) !== 'number'
      ) {
        return false;
      }

      if (userAnswer.id.length !== 16) {
        return false;
      }

      if (answer.question.type === 'findmatch') {
        if (!userAnswer.hasOwnProperty('equivalent')) {
          return false;
        }

        if ( typeof(userAnswer.equivalent) !== 'string'
          || userAnswer.equivalent.length !== 16 )
        {
          return false;
        }
      }
    }
  }

  return true;
}

module.exports = validateUserAnswer;