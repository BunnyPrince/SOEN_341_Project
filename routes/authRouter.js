const express = require('express')
const router = express.Router()

// Error handling
const asyncErr = require('../.utils/asyncErr')

// Middlewares
const isLogged = require('../.utils/isLogged')
const whenLogged = require('../.utils/whenLogged')

// Controller
const authController = require('../controllers/authController')
const {logout} = authController

/* This router file contains all routes related to login, registration, feed, logout  */

/* ============================ Routes =============================*/

router.get('/', asyncErr(authController.loginFeed))

router.post('/login', asyncErr(authController.verifyLogin))

router.get('/register', whenLogged, authController.registerForm)

router.post('/register', asyncErr(authController.verifyRegister))

router.get('/profile', isLogged, asyncErr(authController.profile))

router.post('/logout', logout)

module.exports = router
