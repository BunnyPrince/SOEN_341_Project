const checkoutUser = async (req, User) => {
    const {username} = req.params
    const user = await User.findOne({username})
        .populate('images')
        .populate('followers')
    if (!user) {
        return undefined
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
    return {user, isBeingFollowed, duplicateUser, overlay: false, usersList: []}
}

const follow = async (req, User) => {
    const userToFollow = await User.findById(req.body.userid)
    const sessionUser = await User.findById(req.session.user_id)

    // Prevent following someone multiple times
    for (let u of userToFollow.followers) {
        if (u.username === sessionUser.username) {
            console.log('duplicate follow')
            return userToFollow
        }
    }
    sessionUser.follows.push(userToFollow)
    await sessionUser.save()
    userToFollow.followers.push(sessionUser)
    await userToFollow.save()

    // console.log(sessionUser.username + ' is now following ' + userToFollow.username)
    return userToFollow
}

const unfollow = async (req, User) => {
    const userToUnfollow = {...req.body}
    const sessionUserId = req.session.user_id
    const sessionUser = await User.findByIdAndUpdate(sessionUserId, {$pull: {follows: userToUnfollow.userid}})
    await User.findByIdAndUpdate(userToUnfollow.userid, {$pull: {followers: sessionUserId}})
    // console.log(sessionUser.username + ' has unfollowed ' + userToUnfollow.username)
    return userToUnfollow

}

const listOfUsers = async (req, User) => {
    const {f: option} = req.params
    // console.log('list option:', option)
    if (option !== 'followers' && option !== 'follows')
        return undefined
    const user = await User.findById(req.body.userid)
        .populate('images')
        .populate(option)
    // console.log('List to users (', option, '): ', user[option])
    return {
        user,
        duplicateUser: req.body.duplicateUser,
        isBeingFollowed: req.body.isBeingFollowed,
        overlay: true,
        usersList: user[option]
    }
}

module.exports = {
    checkoutUser,
    follow,
    unfollow,
    listOfUsers
}
