// function to check if user is logged in
const isLogged = (req, res, next) => {
    if (!req.session)
        return res.redirect('/')
    const {userId} = req.session
    if (userId)
        return next() // allow user to see instagram
    else
        return res.redirect('/') // if not logged in, redirect to login
}
module.exports = isLogged
