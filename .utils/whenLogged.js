
const isLogged = (req, res, next) => {
    const {user_id} = req.session
    if (user_id)
        return next() // allow user to see instagram
    else
        return res.redirect('/') // if not logged in, redirect to login
}
module.exports = isLogged
