const Image = require('../models/image')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const login_feed = async (req, res) => {
    if (req.session.user_id) {
        let {follows} = await User.findById(req.session.user_id)
        let feedImgs = await Image.find({user: {$in: follows}}).populate('user').populate('comments')
        console.log(feedImgs)
        return res.render('feed', {feedImgs});
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
            url: "data:image/png;base64,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",
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
