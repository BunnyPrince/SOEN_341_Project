const express = require('express')
const router = express.Router()
// const Image = require('./models/image')
// const Comment = require('./models/comment')
const User = require('../models/user')
    // Routers
const imgRouter = require('./imgRouter')
const authRouter = require('./authRouter')
    // Error handling
const ExpressError = require('../.utils/ExpressError')
const asyncErr = require('../.utils/asyncErr')
const Joi = require('joi') // schema validation

/* ----------------------------- Middleware ----------------------------*/
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

/* ================================== Routes ==================================*/
// user profile
router.get('/:username', isLogged, asyncErr(async (req, res, next) => {
    const {username} = req.params
    const user = await User.findOne({username}).populate('images')
    if (!user) // if profile page does not exist, send to error page
        return next()
    const userSession = await User.findById(req.session.user_id)
    let duplicateUser = false;
    if (userSession.username === user.username)
        duplicateUser = true
    let isBeingFollowed = false
    const users = await User.find({follows: {$in: [user._id]}})
    for (const u of users) {
        if (u.username === userSession.username) {
            isBeingFollowed = true;
            console.log(u.username);
            break;
        }
    }
    // console.log(isBeingFollowed);
    // console.log(userSession.username + userSession._id + ' follows ' + user.username + user._id + '? ' + isBeingFollowed)
    // console.log(userSession.username + userSession._id + ' same as ' + user.username + user._id + '? ' + duplicateUser)
    return res.render('profile', {user, isBeingFollowed, duplicateUser, overlay: false, usersList: []})

}))
// Show follows and followers list (same route)
router.post('/:username/:f', asyncErr(async (req, res, next) => {
    const {f} = req.params
    if (f !== 'followers' && f !== 'follows')
        return next()
    const user = await User.findById(req.body.userid).populate('images')
    console.log(user[f])
    const usersList = await User.find({_id: {$in: user[f]}})
    return res.render('profile', {
        user,
        duplicateUser: req.body.duplicateUser,
        isBeingFollowed: req.body.isBeingFollowed,
        overlay: true,
        usersList
    })

}))
// follow someone
router.put('/follow', asyncErr(async (req, res) => {
    const userToFollow = await User.findById(req.body.userid)
    const sessionUser = await User.findById(req.session.user_id)

    // Prevent following someone multiple times
    for (let u of userToFollow.followers) {
        if (u.username === sessionUser.username) {
            console.log('duplicate follow')
            return res.redirect('/' + userToFollow.username)
        }
    }
    sessionUser.follows.push(userToFollow)
    await sessionUser.save()
    userToFollow.followers.push(sessionUser)
    await userToFollow.save()

    console.log(sessionUser.username + ' is now following ' + userToFollow.username)
    res.redirect('/' + userToFollow.username)

}))
// unfollow someone */
router.put('/unfollow', asyncErr(async (req, res) => {
    const userToUnfollow = { ... req.body }
    const sessionUser = req.session.user_id

    await User.findByIdAndUpdate(sessionUser, {$pull: {follows: userToUnfollow.userid}})
    await User.findByIdAndUpdate(userToUnfollow.userid, {$pull: {followers: sessionUser}})
    console.log(sessionUser + ' has unfollowed ' + userToUnfollow.username)
    return res.redirect('/' + userToUnfollow.username)

}))

module.exports = router

