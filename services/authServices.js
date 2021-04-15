const showFeed = async (req, User, Image) => {
    let currentUser = await User.findById(req.session.user_id)
    let {follows} = currentUser
    let feedImages = await Image.find({user: {$in: follows}})
        .populate('user')
        .populate('comments')
        .populate("likes")
    return {feedImages, currentUser}
}

const loginToAccount = async (req, User, bcrypt) => { // output
    const {username, password} = req.body
    const searchUser = await User.findOne({username})
    const failedLogin = {
        result: 'failedLogin',
        msg: 'Wrong username and/or password.',
        sessionUser: undefined
    }
    if (!searchUser)
        return failedLogin

    const validPw = await bcrypt.compare(password, searchUser.password)
    if (validPw)
        return {
            result: 'success',
            msg: 'Successful login',
            sessionUser: searchUser
        }
    return failedLogin
}

const createAccount = async (req, User, bcrypt) => {
    const {username, email, password} = req.body
    const db_user = await User.findOne({username})
    const db_email = await User.findOne({email})
    if (db_user || db_email) {
        return {
            result: 'taken',
            msg: 'This username/email have already been used.'
        }
    }
    // hash password before storing
    const hash = await bcrypt.hash(password, 12)
    const newUser = new User({
        username, email, password: hash, pfp: {
            url: 'https://res.cloudinary.com/soen341teamb8/image/upload/v1616987122/ig_photos/defaultPfp_ycybzx.png',
            filename: ''
        }
    })
    await newUser.save()
    // console.log('new user', newUser)
    return {
        result: 'successRegister',
        msg: 'Registration successful'
    }
}

const destroySession = (req) => {
    req.session.user_id = null
    if(typeof req.session.destroy === 'function')
        req.session.destroy() // completely any information stored in session
    console.log('User has logout.')
    return req.session
}

const fetchLoginUser = async (req, User) => {
    const {user_id} = req.session
    return User.findById(user_id)
}

module.exports = {
    showFeed,
    loginToAccount,
    createAccount,
    fetchLoginUser,
    destroySession
}
