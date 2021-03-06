const User = require('../models/user')
const ExpressError = require('../.utils/ExpressError')
const Joi = require('joi') // schema validation

const userProfile = async (req, res, next) => {
    const {username} = req.params
    const user = await User.findOne({username}).populate('images')
    if (!user) {
        return next(new ExpressError(404, 'User Not Found.'))
    }
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
}
const showListFollows = async (req, res, next) => {
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
}
const profileFollow = async (req, res) => {
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

}
const profileUnfollow = async (req, res) => {
    const userToUnfollow = { ... req.body }
    const sessionUser = req.session.user_id

    await User.findByIdAndUpdate(sessionUser, {$pull: {follows: userToUnfollow.userid}})
    await User.findByIdAndUpdate(userToUnfollow.userid, {$pull: {followers: sessionUser}})
    console.log(sessionUser + ' has unfollowed ' + userToUnfollow.username)
    return res.redirect('/' + userToUnfollow.username)
}

module.exports = {
    userProfile,
    showListFollows,
    profileFollow,
    profileUnfollow
}
