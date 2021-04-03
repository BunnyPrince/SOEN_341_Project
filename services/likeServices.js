const like = async (req, Image) => {
    const imageToLikeId = req.body.image
    const sessionUserId = req.session.user_id
    return Image.findByIdAndUpdate(imageToLikeId, {$push: {likes: sessionUserId}})
}

const unlike = async (req, Image) => {
    const imageToUnlikeId = req.body.image
    const sessionUserId = req.session.user_id
    return Image.findByIdAndUpdate(imageToUnlikeId, {$pull: {likes: sessionUserId}})
}

module.exports = {
    like,
    unlike
}
