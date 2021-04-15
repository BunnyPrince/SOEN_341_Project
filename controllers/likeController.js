const Image = require('../models/image')
const {like, unlike} = require('../services/likeServices')

const profileLikeImage = async (req, res) => {
    const image = await like(req, Image)
    console.log('liked')
}

const profileUnlikeImage = async (req, res) => {
    const image = await unlike(req, Image)
    console.log('unliked')
}

module.exports = {
    profileLikeImage,
    profileUnlikeImage
}
