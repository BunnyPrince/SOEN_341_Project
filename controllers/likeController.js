const Image = require('../models/image')
const {like, unlike} = require('../services/likeServices')

const profileLikeImage = async (req, res) => {
    const image = await like(req, Image)
}

const profileUnlikeImage = async (req, res) => {
    const image = await unlike(req, Image)
}

module.exports = {
    profileLikeImage,
    profileUnlikeImage
}
