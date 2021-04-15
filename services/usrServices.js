const checkoutUser = async (req, User) => {
    const {username} = req.params
    const user = await User.findOne({username})
        .populate('images')
        .populate('followers')
    if (!user) {
        return undefined
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
    return {user,
        isBeingFollowed,
        duplicateUser,
        overlay: false,
        usersList: []
    }
}

const follow = async (req, User) => {
    const userToFollow = await User.findById(req.body.userid)
    const sessionUser = await User.findById(req.session.user_id)
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

    return userToFollow
}

const unfollow = async (req, User) => {
    const userToUnfollow = {...req.body}
    const sessionUserId = req.session.user_id
    await User.findByIdAndUpdate(sessionUserId, {$pull: {follows: userToUnfollow.userid}})
    await User.findByIdAndUpdate(userToUnfollow.userid, {$pull: {followers: sessionUserId}})
    return userToUnfollow
}

const listOfUsers = async (req, User) => {
    const {f: option} = req.params
    if (option !== 'followers' && option !== 'follows')
        return undefined
    const user = await User.findById(req.body.userid)
        .populate('images')
        .populate(option)
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
