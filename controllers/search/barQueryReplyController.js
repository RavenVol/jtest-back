const searchForTest = require('./searchForTest');
const searchForResult = require('./searchForResult');
const searchForAuthor = require('./searchForAuthor');

const barQueryReplyController = async(req, res) => {
  console.log('barQueryReplyController');
  const body = JSON.parse(JSON.stringify(req.body));
  const { searchQuery } = body;

  if (typeof(searchQuery) !== 'string' && searchQuery.length < 3) return res.json({message: 'min'});

  const searchArray = searchQuery.split(/[\.\^\*\+\?\{\}\[\]\\\|\(\)\s:;'"/$,<>]/).filter(word => word.length >= 3);
  if (!searchArray.length) return res.json({message: 'min'});

  const tests = await searchForTest(searchArray);
  const results = await searchForResult(searchArray);
  const authors = await searchForAuthor(searchArray);

  if (tests.length === 0 && results.length === 0 && authors.length === 0) {
    return res.json({message : 'nothing'});
  }

  res.json({message: 'OK', tests, results, authors});
}

module.exports = barQueryReplyController;