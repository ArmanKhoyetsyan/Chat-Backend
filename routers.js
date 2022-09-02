const express = require('express');
const { logIn, getMessagesDb } = require('./controllers/users.controllers');
const authorizationHandler = require('./middleware');

const router = express.Router();

router.post('/login', authorizationHandler, (req, res) => logIn(req, res))
router.get('/getMessages', authorizationHandler, (req, res) => getMessagesDb(req, res))

module.exports = router;
