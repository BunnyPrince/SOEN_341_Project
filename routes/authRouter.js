const express = require('express')
const router = express.Router()
const session = require('express-session')
const flash = require('connect-flash')
const path = require('path')
const methodOverride = require('method-override')
const Image = require('../models/image')
const User = require('../models/user')
const bcrypt = require('bcrypt')
    // Error handling
const ExpressError = require('../.utils/ExpressError')
const asyncErr = require('../.utils/asyncErr')
const Joi = require('joi') // schema validation
    // Other utils
// const isLogged = require('../.utils/isLogged')
// const whenLogged = require('../.utils/whenLogged')


/* This router file contains all routes related to login, registration, feed, logout  */

/* -------------------------------------------------- Setting up middleware -------------------------------------------------- */
// middleware that prints logs about the session object

// function to check if user is logged in
const isLogged = (req, res, next) => {
    const {user_id} = req.session
    if (user_id)
        return next() // allow user to see instagram
    else
        return res.redirect('/') // if not logged in, redirect to login
}
// function does not allow a logged in user to see the login or register page
const whenLogged = (req, res, next) => {
    const {user_id} = req.session
    if (!user_id)
        return next() // allow user to see registration and/or login forms
    else
        return res.redirect('/') // if logged in, redirect to FEED
}
/* ======================================== Routes =========================================*/
router.get('/', asyncErr(async (req, res) => {
    if (req.session.user_id) {
        let {follows} = await User.findById(req.session.user_id)
        let feedImgs = await Image.find({user: {$in: follows}})
        // console.log(feedImgs)
        return res.render('feed', {feedImgs});
    }
    res.render('login', {
        msg:
            [req.flash('failedLogin'), req.flash('successRegister')]
    })
}))
router.post('/login', asyncErr(async (req, res) => {
    const {username, password} = req.body
    const searchUser = await User.findOne({username})
    if (!searchUser) {
        console.log('Failed login')
        req.flash('failedLogin', "Wrong username and/or password.")
        return res.redirect('/') // implement wrong username/pw message
    }
    // match to password
    const validPw = await bcrypt.compare(password, searchUser.password)

    if (validPw) {
        // if success login, store user._id in session
        req.session.user_id = searchUser._id
        console.log("success login") // TO-DO: implement success login message
        return res.redirect('/')
    }
    console.log('Failed login')
    req.flash('failedLogin', "Wrong username and/or password.")
    res.redirect('/')

}))
/* router.get('/search', (req, res) => {
    res.render('search')
})*/
router.get('/register', whenLogged, (req, res) => {
    res.render('register', {msg: req.flash('taken')})
})
router.post('/register', asyncErr(async (req, res) => {
    const {username, email, password} = req.body
    const db_user = await User.findOne({username})
    const db_email = await User.findOne({email})
    if (db_user || db_email) {
        req.flash('taken', 'This username/email have already been used.')
        return res.redirect('/register')
    }
    // hash password before storing
    const hash = await bcrypt.hash(password, 12)

    // create user if data valid, and redirect to login
    const newUser = new User({username, email, password: hash})
    await newUser.save()
    console.log(newUser)
    req.flash('successRegister', 'Registration successful!')
    res.redirect('/')

}))
router.get('/profile', isLogged, asyncErr(async (req, res) => {
    const {user_id} = req.session
    const user = await User.findById(user_id)
    res.redirect(`/${user.username}`); // redirect to '/<username>'
}))
router.post('/logout', (req, res) => {
    req.session.user_id = null
    req.session.destroy() // completely any information stored in session
    res.redirect('/')
})

module.exports = router
