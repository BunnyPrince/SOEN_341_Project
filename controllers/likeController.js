const Image = require('../models/image')
const {like, unlike} = require('../services/likeServices')
// planned unused variables (helpful in the future)
// const User = require('../models/user')
// const ExpressError = require('../.utils/ExpressError')
// const Joi = require('joi') // schema validation

const profileLikeImage = async (req, res) => {
    const image = await like(req, Image)
    console.log('liked')
}

const profileUnlikeImage = async (req, res) => {
    const image = await unlike(req, Image)
    console.log("unliked")
}

module.exports = {
    profileLikeImage,
    profileUnlikeImage
}
