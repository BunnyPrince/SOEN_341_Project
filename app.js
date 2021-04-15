if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
} // current env: "development"
const express = require('express')
const app = express()
const session = require('express-session')
const flash = require('connect-flash')
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const User = require('./models/user')

const imgRouter = require('./routes/imgRouter')
const authRouter = require('./routes/authRouter')
const usrRouter = require('./routes/usrRouter')
const likeRouter = require('./routes/likeRouter')
const ExpressError = require('./.utils/ExpressError')
const asyncErr = require('./.utils/asyncErr')
const isLogged = require('./.utils/isLogged')
const whenLogged = require('./.utils/whenLogged')

/* ----------------------- configuration of dir, templates, EJS, encoding & route overriding ------------------------- */
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(express.static(path.join(__dirname, './public')));
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))

const secret = 'badly_kept_secret' || process.env.SECRET
app.use(session({
    secret,
    resave: false,
    saveUninitialized: false
}))

app.use(flash())

/* -------------------------------------------------- Setting up middleware -------------------------------------------------- */
// pfp on navbar middleware
app.use(asyncErr(async (req, res, next) => {
    const {userId} = req.session
    if (userId) {
        const { pfp } = await User.findById(userId)
        res.locals.pfp = pfp
    }
    next()
}))


/* ---------------------------------------------------- MongoDB connection ---------------------------------------------------- */
let db_name = 'ig_db'
mongoose.connect(`mongodb://localhost:27017/${db_name}`, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then()

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Database connected')
})

/* ===================================== RESTFUL ROUTES   ====================================  */
app.use('/', authRouter)

app.get('/search', (req, res) => {
    res.render('search')
})
app.use('/images', isLogged, imgRouter)

app.use('/', isLogged, usrRouter)

app.use('/', likeRouter)


// Error routes
/*app.all('*', (req, res, next) => {
    next(new ExpressError('404', 'Page Not Found'))
})*/

app.use((err, req, res, next) => {
    if(!err.status) {
        err.status = 500
        err.message = 'Internal error'
    }
    res.status(err.status).render('errorPage', {err})
    next(err)
})

app.use((err, req, res, next) => {
    console.log('=============================')
    console.log(err.status, err.message)
    console.log('Stack trace: ', err.stack)
    console.log('=============================')
})

app.get('*', (req, res, next) => {
    const err = {status: 404, message: 'Page not found.'}
    res.status(404).render('errorPage', {err})
})

module.exports = app
