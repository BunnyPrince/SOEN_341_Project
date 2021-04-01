const destroySession = (req) => {
    req.session.user_id = null
    req.session.destroy() // completely any information stored in session
    console.log('User has logout.')
    return req.session
}

module.exports = {destroySession}
