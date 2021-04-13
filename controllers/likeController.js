const Image = require('../models/image')
const { like, unlike } = require('../services/likeServices')
const User = require('../models/user')
const ExpressError = require('../.utils/ExpressError')
const Joi = require('joi') // schema validation

const profileLikeImage = async (req, res) => {
    const image = await like(req, Image)
    console.log('liked')
    // for debugging only, de-comment if needed
    // const image = await Image.findById(imageToLikeId)
    // image.likes.forEach(u => console.log(u))
}

const profileUnlikeImage = async (req, res) => {
    const image = await unlike(req, Image)
    console.log("unliked")
    // for debugging only, de-comment if needed
    // const image = await Image.findById(imageToUnlikeId)
    // image.likes.forEach(u => console.log(u))
    // console.log('')
}

module.exports = {
    profileLikeImage,
    profileUnlikeImage
}
