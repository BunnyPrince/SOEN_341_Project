const Image = require('../models/image')
const User = require('../models/user')
const {showFeed, loginToAccount, createAccount, fetchLoginUser, destroySession} = require('../services/authServices')
const bcrypt = require('bcrypt')

const login_feed = async (req, res) => {
    const sessionUserID = req.session.user_id
    if (sessionUserID) {
        let {feedImages, currentUser} = await showFeed(req, User, Image)
        return res.render('feed', {
            feedImages,
            sessionUserID,
            currentUser
        })
    }
    res.render('login', {
        msg:
            [req.flash('failedLogin'), req.flash('successRegister')]
    })
}

const verifyLogin = async (req, res) => {
    let {result, msg, sessionUser} = await loginToAccount(req, User, bcrypt)
    if (!sessionUser)
        req.flash(result, msg)
    else
        req.session.user_id = sessionUser._id
    res.redirect('/')
}

const registerForm = (req, res) => {
    res.render('register', {msg: req.flash('taken')})
}

const verifyRegister = async (req, res) => {
    let {result, msg} = await createAccount(req, User, bcrypt)
    req.flash(result, msg)
    if (result === 'successRegister')
        return res.redirect('/')
    return res.redirect('/register')
}

const profile = async (req, res) => {
    const user = await fetchLoginUser(req, User)
    res.redirect(`/${user.username}`)
}
const logout = (req, res) => {
    destroySession(req)
    res.redirect('/')
}
module.exports = {
    login_feed,
    verifyLogin,
    registerForm,
    verifyRegister,
    profile,
    logout
}
