const router = require('express').Router();
const multer = require('multer');
const testSaveController = require('../controllers/test/testSaveController');
const returnTestsSummaryController = require('../controllers/test/returnTestsSummaryController');
const returnTestController = require('../controllers/test/returnTestController');
const testStartController = require('../controllers/test/testStartController');
const returnQuestionController = require('../controllers/test/returnQuestionController');
const saveUserAnswerController = require('../controllers/test/saveUserAnswerController');
const saveTestResultController = require('../controllers/test/saveTestResultController');
const returnTestResultController = require('../controllers/test/returnTestResultController');
const addFreeAnswerController = require('../controllers/test/addFreeAnswerController');
const returnTestDataController = require('../controllers/test/returnTestDataController');
const returnMyResultsController = require('../controllers/test/returnMyResultsController');
const returnMyTestsController = require('../controllers/test/returnMyTestsController');
const returnUsersResultsController = require('../controllers/test/returnUsersResultsController');
const returnFriendsTestController = require('../controllers/test/returnFriendsTestController');

const encodeMulter = multer({dest: 'images/tests'}).any();

router.post('/save', encodeMulter, testSaveController);
router.get('/allsum', returnTestsSummaryController);
router.get('/get*', returnTestController);
router.post('/start', encodeMulter, testStartController);
router.post('/question', encodeMulter, returnQuestionController);
router.post('/answer', encodeMulter, saveUserAnswerController);
router.post('/resultsave', encodeMulter, saveTestResultController);
router.post('/resultget', encodeMulter, returnTestResultController);
router.post('/addfreeanswer', encodeMulter, addFreeAnswerController);
router.post('/mytests', encodeMulter, returnMyTestsController);
router.post('/myresults', encodeMulter, returnMyResultsController);
router.post('/getTest', encodeMulter, returnTestDataController);
router.post('/usersresults', encodeMulter, returnUsersResultsController);
router.post('/friendstest', encodeMulter, returnFriendsTestController);


module.exports = router;