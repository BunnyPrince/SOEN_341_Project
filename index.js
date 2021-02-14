const session = require('express-session')
const flash = require('connect-flash')
const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const Image = require('./models/image')
const Comment = require('./models/comment')
const User = require('./models/user')
const bcrypt = require('bcrypt')


/* ----------------------- configuration of dir, templates, EJS, encoding & route overriding ------------------------- */
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(express.static(path.join(__dirname, './public')));
app.use(express.urlencoded({ extended:true }))
app.use(methodOverride('_method'))

const secret = 'badly_kept_secret' || process.env.SECRET
app.use(session({
    secret,
    resave: false,
    saveUninitialized: false
}))

app.use(flash())

/* -------------------------------------------------- Setting up middleware -------------------------------------------------- */
// testing middleware to get session object
app.use((req, res, next) => {
    const { user_id } = req.session
    if (user_id)
        console.log(user_id, 'is logged in!')
    else
        console.log('Not logged in')
    next()
})
// function to check if user is logged in
const isLogged = (req, res, next) => {
    const { user_id } = req.session
    if (user_id)
        return next() // allow user to see instagram
    else
        return res.redirect('/test-login') // if not logged in, redirect to login
}

// testing middleware to get flash object
/* app.use((req, res, next) => {
    const msg = req.flash('success') || ''
    res.locals.messages = msg
    console.log('message', msg)
    next()
}) */

// defining middleware that are inserted into specific paths
const verifyPsw = (req, res, next) => {
    const { psw } = req.query
    if (psw)
        return next()
    res.send('ENTER PASSWORD TO ACCESS ROUTE')
}


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

/* ==================================================== RESTFUL ROUTES & MONGOOSE CRUD  ====================================================  */
/* landing page */
app.get('/', (req, res) => {
    res.render('login')
})
/* index */
app.get('/images', isLogged, async (req, res) => {
    const images = await Image.find({});
    res.render('images/index', { images })
})
/* create */
app.get('/images/new', isLogged,(req, res) => {
    res.render('images/new');
})

app.get('/feed', isLogged,(req, res) => {
    res.render('feed');
})

app.get('/profile', (req, res) => {
    res.render('profile');
})
app.get('/search', (req, res) => {
    res.render('search');
})
app.get('/register', (req, res) => {
    res.render('register');
})
app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/images', async (req, res) => {
    const image = new Image(req.body.image);
    await image.save();
    res.redirect(`/images/${image._id}`)
})
/* show */
app.get('/images/:id', async (req, res) => {
    const image = await Image.findById(req.params.id).populate('comments')
    res.render('images/show', {image})
})
/* new review post route */
app.post('/images/:id/comments', async (req, res) => {
    const image = await Image.findById(req.params.id)
    const comment = new Comment(req.body.comment)
    image.comments.push(comment)
    await comment.save()
    await image.save()
    res.redirect(`/images/${image._id}`)
})
/* delete comment */
app.delete('/images/:imageId/comments/:commentId', async (req, res) => {
    const { imageId, commentId } = req.params
    const image = await Image.findByIdAndUpdate(imageId, {  $pull: {comments: commentId} })/* delete reference to comment */
    await Comment.findByIdAndDelete(req.params.commentId)
    res.redirect(`/images/${image._id}`)
})
/* update */
app.get('/images/:id/edit', async (req, res) => {
    const image = await Image.findById(req.params.id)
    res.render('images/edit', { image });
})
app.put('/images/:id', async (req, res) => {
    const { id } = req.params;
    const image = await Image.findByIdAndUpdate(id, { ...req.body.image });
    res.redirect(`/images/${image._id}`)
});
/* to do */
app.delete('/images/:id', async (req, res) => {
    const { id } = req.params;
    await Image.findByIdAndDelete(id);
    res.redirect('/images');
})

/* ------------------------------------------------ Testing ------------------------------------------------ */
// Testing user registration and login
app.get('/test-register', (req, res) => {

    res.send(`
        <h2>${req.flash('taken')}</h2>
        <form action="/test-register" method="post">
        <input type="text" name="user[username]" placeholder="username">
        <input type="email" name="user[email]" placeholder="email">
        <input type="text" name="user[password]" placeholder="password">
        <button type="submit">Join</button>
        </form>
    `)
})
app.post('/test-register', async (req, res) => {
    const {username, email, password} = req.body.user
    const db_user = await User.findOne({username})
    const db_email = await User.findOne({email})
    if (db_user || db_email) {
        req.flash('taken', 'This username/email have already been used.')
        return res.redirect('/test-register')
    }
    // hash password before storing
    const hash = await bcrypt.hash(password, 12)

    // create user if data valid
    const newUser = new User({username, email, password:hash})
    await newUser.save()
    console.log(newUser)
    res.send('POSTED USER REGISTRATION TEST!')
})
app.get('/test-login', (req, res) => {

    res.send(`
        ${req.flash('failedLogin')}
        <form action="/test-login" method="post">
            <input type="text" name="username" required>
            <input type="text" name="password" required>
            <button type="submit">Login</button>
        </form>
    `)
})
app.post('/test-login', async (req, res) => {
    const { username, password } = req.body

    // search username
    const searchUser = await User.findOne({ username })
    if (!searchUser) {
        console.log('Failed login')
        req.flash('failedLogin', "Wrong username and/or password.")
        return res.redirect('/test-login') // implement wrong username/pw message
    }
    // match to password
    const validPw = await bcrypt.compare(password, searchUser.password)

    if (validPw) {
        // if success login, store user._id in session
        req.session.user_id = searchUser._id
        console.log("success login") // implement success login message
        res.redirect('/')
    }

    else {
        console.log('Failed login')
        req.flash('failedLogin', "Wrong username and/or password.")
        res.redirect('/test-login') // implement wrong username/pw message
    }
})


/* ============================================= connection to the port/localhost ============================================= */
const port = 3000 || process.env.PORT
app.listen(port, () => {
    console.log('Connected to port', port)
})
