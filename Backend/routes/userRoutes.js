const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validate, handleValidation } = require('../controllers/userController');

router.post('/register', validate('register'), handleValidation, userController.register);
router.post('/login', validate('login'), handleValidation, userController.login);

module.exports = router; 