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
// middleware that prints logs about the session object
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
        return res.redirect('/') // if not logged in, redirect to login
}
// function does not allow a logged in user to see the login or register page
const whenLogged = (req, res, next) => {
    const { user_id } = req.session
    if (!user_id)
        return next() // allow user to see registration and/or login forms
    else
        return res.redirect('/') // if logged in, redirect to FEED
}


// testing middleware to get flash object
/* app.use((req, res, next) => {
    const msg = req.flash('success') || ''
    res.locals.messages = msg
    console.log('message', msg)
    next()
}) */



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
    if (req.session.user_id)
        return res.render('feed');
    else {
        res.render('login', {   msg:
                [req.flash('failedLogin'), req.flash('successRegister')]    })
    }
})
app.post('/login', async (req, res) => {
    const { username, password } = req.body

    // search username
    const searchUser = await User.findOne({ username })
    if (!searchUser) {
        console.log('Failed login')
        req.flash('failedLogin', "Wrong username and/or password.")
        return res.redirect('/') // implement wrong username/pw message
    }
    // match to password
    const validPw = await bcrypt.compare(password, searchUser.password)

    if (validPw) {
        // if success login, store user._id in session
        req.session.user_id = searchUser._id
        console.log("success login") // TO-DO: implement success login message
        res.redirect('/')
    }

    else {
        console.log('Failed login')
        req.flash('failedLogin', "Wrong username and/or password.")
        res.redirect('/')
    }

    // res.send('POST METHOD /login - Error route')
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

/* app.get('/feed', isLogged,(req, res) => {
    res.render('feed');
}) */

app.get('/profile', isLogged, (req, res) => {
    res.render('profile');
})
app.get('/search', (req, res) => {
    res.render('search');
})
app.get('/register', whenLogged,(req, res) => {
    res.render('register', {msg:req.flash('taken')});
})
app.post('/register', async (req, res) => {
    const {username, email, password} = req.body
    const db_user = await User.findOne({username})
    const db_email = await User.findOne({email})
    if (db_user || db_email) {
        req.flash('taken', 'This username/email have already been used.')
        return res.redirect('/register')
    }
    // hash password before storing
    const hash = await bcrypt.hash(password, 12)

    // create user if data valid
    const newUser = new User({username, email, password:hash})
    await newUser.save()
    console.log(newUser)
    req.flash('successRegister', 'Registration successful!')
    res.redirect('/')

})

app.post('/logout', (req, res) => {
    req.session.user_id = null
    req.session.destroy() // completely any information stored in session
    res.redirect('/')
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
})
/* to do */
app.delete('/images/:id', async (req, res) => {
    const { id } = req.params;
    await Image.findByIdAndDelete(id);
    res.redirect('/images');
})

/* ------------------------------------------------ Testing ------------------------------------------------ */
// Testing the error route
app.get('*', (req, res) => {
    res.send('404: page not found.')
})


/* ============================================= connection to the port/localhost ============================================= */
const port = 3000 || process.env.PORT
app.listen(port, () => {
    console.log('Connected to port', port)
})
