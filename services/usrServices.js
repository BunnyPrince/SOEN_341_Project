const checkoutUser = async(req, User) => {
    const {username} = req.params
    const user = await User.findOne({username})
        .populate('images')
        .populate('followers')
    if (!user) {
        return {user, isBeingFollowed: undefined, duplicateUser: undefined}
        // return next(new ExpressError(404, 'Sorry, this page isn\'t available.'))
    }
    const {followers} = user
    const {user_id: sessionUserId} = req.session
    let duplicateUser = (sessionUserId === user._id.toString())
    let isBeingFollowed = false
    for (const follower of followers) {
        if (follower._id.toString() === sessionUserId) {
            isBeingFollowed = true
            break
        }
    }
    return {user, isBeingFollowed, duplicateUser}
}

module.exports = {
    checkoutUser
}
