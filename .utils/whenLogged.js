// function does not allow a logged in user to see the login or register page
const whenLogged = (req, res, next) => {
    if (!req.session)
        return next()
    const {userId} = req.session
    if (!userId)
        return next() // allow user to see registration and/or login forms
    else
        return res.redirect('/') // if logged in, redirect to FEED
}
module.exports = whenLogged
