const { availableTestLangs, testTypes, editRightsTypes, questionTypeTypes, answersTypes } = require('../../config/test-cfg');

const validateTest = (test) => {
  console.log('validateTest');
  if (typeof(test) !== 'object') {
    return false;
  }

  if (test.hasOwnProperty('id') && test.id && (typeof(test.id) !== 'string' || test.id.length !== 16)) {
    return false;
  }

  if ( !test.hasOwnProperty('langs') 
    || !test.hasOwnProperty('type')
    || !test.hasOwnProperty('testName')
    || !test.hasOwnProperty('question_qtty')
    || !test.hasOwnProperty('retry') 
    || !test.hasOwnProperty('edit_rights')
    || !test.hasOwnProperty('testEditUsers')
    || !test.hasOwnProperty('category')
    || !test.hasOwnProperty('status')
    || !test.hasOwnProperty('questions')
    || !test.hasOwnProperty('questions_order')
  ) {
    return false;
  }
  
  if ( typeof(test.langs) !== 'object'
    || typeof(test.type) !== 'string'
    || typeof(test.testName) !== 'object'
    || typeof(test.question_qtty) !== 'number'
    || typeof(test.retry) !== 'number'
    || typeof(test.edit_rights) !== 'string'
    || typeof(test.testEditUsers) !== 'object'
    || typeof(test.category) !== 'number'
    || typeof(test.status) !== 'string'
    || typeof(test.questions) !== 'object'
    || typeof(test.questions_order) !== 'string'
  ) {
    return false;
  }

  if (test.hasOwnProperty('color')) {
    if ( typeof(test.color) !== 'number' 
      || test.color < 0
      || test.color > 255
    ) {
      return false;
    }
  }

  if (!testTypes.includes(test.type)) {
    return false;
  }

  if (!editRightsTypes.includes(test.edit_rights)) {
    return false;
  }

  if (
    test.langs.map(lang => {
      if (!availableTestLangs.includes(lang)) {
        return false;
      }
      if (!test.testName.hasOwnProperty(lang)) {
        return false;
      }
      if (typeof(test.testName[lang]) !== 'string') {
        return false;
      }
    }).includes(false)
  ) {
    return false;
  }

  if (test.testEditUsers.length > 0 && test.testEditUsers.some(email => typeof(email) !== 'string')) {
    return false;
  }

  if ( test.questions_order !== 'random'
    && test.questions_order !== 'order') {
      return false;
  }

  if ( test.status !== 'published' 
    && test.status !== 'edit'
    && test.status !== 'deleted'
  ) {
    return false
  }

  if (
    test.questions.map(question => {
      if ( !question.hasOwnProperty('name')
        || !question.hasOwnProperty('price')
        || !question.hasOwnProperty('type')
        || !question.hasOwnProperty('timeout')
        || !question.hasOwnProperty('answersType')
        || !question.hasOwnProperty('text')
        || !question.hasOwnProperty('answers')
        || !question.hasOwnProperty('position')
      ) {
        return false;
      }

      if ( typeof(question.name) !== 'string'
        || typeof(question.price) !== 'number'
        || typeof(question.type) !== 'string'
        || typeof(question.timeout) !== 'number'
        || typeof(question.answersType) !== 'string'
        || typeof(question.text) !== 'object'
        || typeof(question.answers) !== 'object'
        || typeof(question.position) !== 'number'
      ) {
        return false;
      }

      if (question.price <= 0) {
        return false;
      }
      
      if (!questionTypeTypes.includes(question.type)) {
        return false;
      }

      if (!answersTypes.includes(question.answersType)) {
        return false;
      }

      if ( question.position < 0
        || question.position > test.questions.length - 1
      ) {
        return false;
      }

      if (
        test.langs.map(lang => {
          if ( !question.text.hasOwnProperty(lang)
            || typeof(question.text[lang]) !== 'string'
          ) {
            return false;
          }          
        }).includes(false)
      ) {
        return false;
      }

      if (  
        question.answers.map(answer => {
          if ( !answer.hasOwnProperty('correct')
            || !answer.hasOwnProperty('order')
            || !answer.hasOwnProperty('text')
            || !answer.hasOwnProperty('equivalent')
          ) {
            return false;
          }

          if ( typeof(answer.correct) !== 'boolean'
            || typeof(answer.order) !== 'number'
            || typeof(answer.text) !== 'object'
            || typeof(answer.equivalent) !== 'object'
          ) {
            return false;
          }

          if (
            test.langs.map(lang => {
              if ( !answer.text.hasOwnProperty(lang)
                || !answer.equivalent.hasOwnProperty(lang)
              ) {
                return false;
              }

              if ( typeof(answer.text[lang]) !== 'string'
                || typeof(answer.equivalent[lang]) !== 'string'
              ) {
                return false;
              }
            }).includes(false)
          ) {
            return false;
          }
        }).includes(false)
      ) {
        return false;
      }
    }).includes(false)
  ) {
    return false;
  }
  return true;
}

module.exports = validateTest;