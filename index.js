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
    // Schemas
// const Image = require('./models/image')
// const Comment = require('./models/comment')
const User = require('./models/user')
// const bcrypt = require('bcrypt')
    // Routers
const imgRouter = require('./routes/imgRouter')
const authRouter = require('./routes/authRouter')
const usrRouter = require('./routes/usrRouter')
const accRouter = require('./routes/accRouter')
    // Error handling
const ExpressError = require('./.utils/ExpressError')
const asyncErr = require('./.utils/asyncErr')
// const Joi = require('joi') // schema validation
    // Middlewares
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
// middleware that prints logs about the session object
/*
app.use((req, res, next) => {
    const {user_id} = req.session
    if (user_id)
        console.log(user_id, 'is logged in!')
    else
        console.log('Not logged in')
    next()
}) */
// pfp on navbar middleware
app.use(asyncErr(async (req, res, next) => {
 /*   if (!req.session)
        return redirect('/') */
    const {user_id} = req.session
    if (user_id) {
        const { pfp } = await User.findById(user_id)
        res.locals.pfp = pfp
    }
    next()
}))


/* ---------------------------------------------------- MongoDB connection ---------------------------------------------------- */
let db_name = 'ig_db'
mongoose.connect('mongodb://localhost:27017/' + db_name, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false     /* remove findAndModify deprecation warning */
}).then()

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

/* ===================================== RESTFUL ROUTES   ====================================  */
app.use('/', authRouter)

app.get('/search', (req, res) => {
    res.render('search')
})
app.use('/images', isLogged, imgRouter)

app.use('/', isLogged, usrRouter)

// To-do: account setting routes
app.use('/account', accRouter)

// Error routes
app.all('*', (req, res, next) => {
    next(new ExpressError('404', 'Page Not Found'))
})
app.use((err, req, res, next) => {
    if (!err.message)
        err.message = 'Something went wrong!'
    if (!err.status)
        err.status = 500
    res.status(err.status).render('errorPage', {err})
    next(err)
})
// Error logger (for development)
app.use((err, req, res, next) => {
    console.log('=========================================================================================================================')
    console.log(err.status, err.message)
    console.log("Stack trace: ", err.stack)
    console.log('=========================================================================================================================')
})

/* ============================================= connection to the port/localhost ============================================= */
const port = 3000 || process.env.PORT
app.listen(port, () => {
    console.log('Connected to port', port)
})
