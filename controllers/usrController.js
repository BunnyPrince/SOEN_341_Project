const User = require('../models/user')
const Image = require('../models/image')
const ExpressError = require('../.utils/ExpressError')
// const Joi = require('joi') // schema validation

const {checkoutUser, follow, unfollow, listOfUsers} = require('../services/usrServices')

const userProfile = async (req, res, next) => {
    let fetchProfileObject = await checkoutUser(req, User)
    if (!fetchProfileObject) {
        return next(new ExpressError(404, 'Sorry, this page isn\'t available.'))
    }
    return res.render('profile', {...fetchProfileObject})
}

const showListFollows = async (req, res, next) => {
    const listOfUsersObject = await listOfUsers(req, User)
    if (!listOfUsersObject)
        return next()
    return res.render('profile', {...listOfUsersObject})
}

const profileFollow = async (req, res) => {
    const userToFollow = await follow(req, User)
    return res.redirect(`/${userToFollow.username}`)
}

const profileUnfollow = async (req, res) => {
    const userToUnfollow = await unfollow(req, User)
    return res.redirect(`/${userToUnfollow.username}`)
}

module.exports = {
    userProfile,
    showListFollows,
    profileFollow,
    profileUnfollow
}
