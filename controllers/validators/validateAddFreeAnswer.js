const validateAddFreeAnswer = (req) => {
  if (typeof(req) !== 'object') return false;

  if ( !req.hasOwnProperty('token') 
    || !req.hasOwnProperty('question_id')
    || !req.hasOwnProperty('question_type')
    || !req.hasOwnProperty('langs')
    || !req.hasOwnProperty('answer')
  ) {
    return false;
  }

  if ( typeof(req.token) !== 'string'
    || typeof(req.question_id) !== 'string'
    || typeof(req.question_type) !== 'string'
    || typeof(req.langs) !== 'object'
    || typeof(req.answer) !== 'object'
  ) {
    return false;
  }

  if (req.question_id.length !== 16) return false;
  if (req.question_type !== 'freeanswer') return false;
  if (req.langs.some(lang => typeof(lang) !== 'string' || lang.length !== 2)) return false;

  if ( !req.answer.hasOwnProperty('id')
    || !req.answer.hasOwnProperty('a_order')
    || !req.answer.hasOwnProperty('correct')
    || !req.answer.hasOwnProperty('text')
  ) {
    return false;
  }

  if ( typeof(req.answer.id) !== 'string'
    || typeof(req.answer.a_order) !== 'number'
    || typeof(req.answer.correct) !== 'boolean'
    || typeof(req.answer.text) !== 'object'    
  ) {
    return false;
  }

  if (req.answer.id.length !== 0 && req.answer.id.length !== 16) return false;

  const textKeys = Object.keys(req.answer.text);
  const textValues = Object.values(req.answer.text);

  if ( textKeys.some(key => !req.langs.includes(key)) ) return false;
  if ( textValues.some(value => typeof(value) !== 'string') ) return false;

  return true;
}

module.exports = validateAddFreeAnswer;