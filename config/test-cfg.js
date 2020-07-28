const availableTestLangs = ['be', 'de', 'en', 'es', 'fr', 'it', 'pl', 'ru', 'ua'];

const testTypes = [
  'education',
  'examination',
  'social',
];

const editRightsTypes = [
  'author',
  'anybody',
  'selected',
];

const questionTypeTypes = [
  'oneofmany',
  'manyofmany',
  'setorder',
  'findmatch',
  'freeanswer',
];

const answersTypes = ['text', 'number'];

module.exports = {
  availableTestLangs,
  testTypes,
  editRightsTypes,
  questionTypeTypes,
  answersTypes
};