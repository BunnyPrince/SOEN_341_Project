// function to check if user is logged in
const isLogged = (req, res, next) => {
    if (!req.session)
        return res.redirect('/')
    const {user_id} = req.session
    if (user_id)
        return next() // allow user to see instagram
    else
        return res.redirect('/') // if not logged in, redirect to login
}
module.exports = isLogged
