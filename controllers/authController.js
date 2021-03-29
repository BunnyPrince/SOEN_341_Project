const Image = require('../models/image')
const User = require('../models/user')
const ExpressError = require('../.utils/ExpressError')
const Joi = require('joi') // schema validation
const bcrypt = require('bcrypt')

const login_feed = async (req, res) => {
    const sessionUserID = req.session.user_id
    if (sessionUserID) {
        let {follows} = await User.findById(sessionUserID)
        let feedImgs = await Image.find({user: {$in: follows}})
            .populate('user')
            .populate('comments')
        return res.render('feed', {
            feedImgs,
            sessionUserID
        });
    }
    res.render('login', {
        msg:
            [req.flash('failedLogin'), req.flash('successRegister')]
    })
}
const verifyLogin = async (req, res) => {
    const {username, password} = req.body
    const searchUser = await User.findOne({username})
    if (!searchUser) {
        console.log('Failed login')
        req.flash('failedLogin', "Wrong username and/or password.")
        return res.redirect('/') // implement wrong username/pw message
    }
    const validPw = await bcrypt.compare(password, searchUser.password)
    if (validPw) {
        req.session.user_id = searchUser._id
        console.log("success login")
        return res.redirect('/')
    }
    // console.log('Failed login')
    req.flash('failedLogin', "Wrong username and/or password.")
    res.redirect('/')

}
const registerForm = (req, res) => {
    res.render('register', {msg: req.flash('taken')})
}
const verifyRegister = async (req, res) => {
    const {username, email, password} = req.body
    const db_user = await User.findOne({username})
    const db_email = await User.findOne({email})
    if (db_user || db_email) {
        req.flash('taken', 'This username/email have already been used.')
        return res.redirect('/register')
    }
    // hash password before storing
    const hash = await bcrypt.hash(password, 12)

    // create user if data valid, and redirect to login (note: add default pfp)
    const newUser = new User({username, email, password: hash, pfp: {
            url: "https://res.cloudinary.com/soen341teamb8/image/upload/v1616987122/ig_photos/defaultPfp_ycybzx.png",
            filename: ''
        }})
    await newUser.save()
    console.log(newUser)
    req.flash('successRegister', 'Registration successful!')
    res.redirect('/')

}
const profile = async (req, res) => {
    const {user_id} = req.session
    const user = await User.findById(user_id)
    res.redirect(`/${user.username}`); // redirect to '/<username>'
}
const logout = (req, res) => {
    req.session.user_id = null
    req.session.destroy() // completely any information stored in session
    console.log('User has logout.')
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
