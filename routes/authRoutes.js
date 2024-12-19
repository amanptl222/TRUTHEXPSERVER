const express = require('express');
const { login, register } = require('../controllers/authController');
const {authenticate} = require('../middlewares/auth');

const router = express.Router();

// Define authentication routes
router.post('/login', login);  // POST request for login
router.post('/register', register);  // POST request for register


module.exports = router;
