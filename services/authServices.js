
const showFeed = async(req, User, Image) => {
    let currentUser = await User.findById(req.session.user_id)
    let {follows} = currentUser
    let feedImages = await Image.find({user: {$in: follows}})
        .populate('user')
        .populate('comments')
        .populate("likes")
    return {feedImages, currentUser}
}

const destroySession = (req) => {
    req.session.user_id = null
    req.session.destroy() // completely any information stored in session
    console.log('User has logout.')
    return req.session
}

module.exports = {
    showFeed,
    destroySession
}
