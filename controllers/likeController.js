const User = require('../models/user')
const Image = require('../models/image')
const ExpressError = require('../.utils/ExpressError')
const Joi = require('joi') // schema validation

const profileLikeImage = async (req, res) => {
    const imageToLikeId = req.body.image
    const sessionUserId = req.session.user_id
    await Image.findByIdAndUpdate(imageToLikeId, {$push: {likes: sessionUserId}})
    // console.log('liked')

    // for debugging only, de-comment if needed
    // const image = await Image.findById(imageToLikeId)
    // image.likes.forEach(u => console.log(u))
    // console.log('')
}

const profileUnlikeImage = async (req, res) => {
    const imageToUnlikeId = req.body.image
    const sessionUserId = req.session.user_id
    await Image.findByIdAndUpdate(imageToUnlikeId, {$pull: {likes: sessionUserId}})
    // console.log("unliked")

    // for debugging only, de-comment if needed
    // const image = await Image.findById(imageToUnlikeId)
    // image.likes.forEach(u => console.log(u))
    // console.log('')
}

module.exports = {
    profileLikeImage,
    profileUnlikeImage
}
