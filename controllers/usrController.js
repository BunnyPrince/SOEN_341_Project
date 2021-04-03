const User = require('../models/user')
const Image = require('../models/image')
const ExpressError = require('../.utils/ExpressError')
const Joi = require('joi') // schema validation
const {checkoutUser} = require('../services/usrServices')


const userProfile = async (req, res, next) => {
    let {user, isBeingFollowed, duplicateUser} = await checkoutUser(req, User)
    if (!user) {
        return next(new ExpressError(404, 'Sorry, this page isn\'t available.'))
    }
    return res.render('profile',
        {user, isBeingFollowed, duplicateUser, overlay: false, usersList: []})
}
const showListFollows = async (req, res, next) => {
    const {f} = req.params
    if (f !== 'followers' && f !== 'follows')
        return next()
    const user = await User.findById(req.body.userid)
        .populate('images')
        .populate(f)
    // console.log(user[f])
    return res.render('profile', {
        user,
        duplicateUser: req.body.duplicateUser,
        isBeingFollowed: req.body.isBeingFollowed,
        overlay: true,
        usersList: user[f]
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
    return res.redirect('/' + userToFollow.username)

}
const profileUnfollow = async (req, res) => {
    const userToUnfollow = {...req.body}
    const sessionUserId = req.session.user_id

    const sessionUser = await User.findByIdAndUpdate(sessionUserId, {$pull: {follows: userToUnfollow.userid}})
    await User.findByIdAndUpdate(userToUnfollow.userid, {$pull: {followers: sessionUserId}})
    console.log(sessionUser.username + ' has unfollowed ' + userToUnfollow.username)
    return res.redirect('/' + userToUnfollow.username)
}

module.exports = {
    userProfile,
    showListFollows,
    profileFollow,
    profileUnfollow
    // , profileLikeImage,
    // profileUnlikeImage
}
