const express = require('express');
const { logIn } = require('./controllers/users.controllers');
const authorizationHandler = require('./middleware');

const router = express.Router();

router.post('/login', authorizationHandler, (req, res) => logIn(req, res))

module.exports = {router};
