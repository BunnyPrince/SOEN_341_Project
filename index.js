if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
} // current env: "development"

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
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const {CloudinaryStorage} = require('multer-storage-cloudinary')


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

// configuring multer, cloudiary (image processing & storage)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'ig_photos',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
})

const upload = multer({storage})

/* -------------------------------------------------- Setting up middleware -------------------------------------------------- */
// middleware that prints logs about the session object
app.use((req, res, next) => {
    const {user_id} = req.session
    if (user_id)
        console.log(user_id, 'is logged in!')
    else
        console.log('Not logged in')
    next()
})
// function to check if user is logged in
const isLogged = (req, res, next) => {
    const {user_id} = req.session
    if (user_id)
        return next() // allow user to see instagram
    else
        return res.redirect('/') // if not logged in, redirect to login
}
// function does not allow a logged in user to see the login or register page
const whenLogged = (req, res, next) => {
    const {user_id} = req.session
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
/* FOR TESTING: DELETE LATER */ // app.use((req, res, next) => {req.session.user_id = 'admin'; next();})
/* ==================================================== RESTFUL ROUTES & MONGOOSE CRUD  ====================================================  */
/* TO-DO: PERSONALIZED FEED */
app.get('/', (req, res) => {
    if (req.session.user_id)
        return res.render('feed');
    else {
        res.render('login', {
            msg:
                [req.flash('failedLogin'), req.flash('successRegister')]
        })
    }
})
app.post('/login', async (req, res) => {
    const {username, password} = req.body
    // ! special admin login data !
    if (username === 'admin' && password === 'soen341') {
        // if success admin login
        req.session.user_id = username
        console.log("ADMIN success login")
        return res.redirect('/')
    }

    // search username
    const searchUser = await User.findOne({username})
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
    } else {
        console.log('Failed login')
        req.flash('failedLogin', "Wrong username and/or password.")
        res.redirect('/')
    }

    // res.send('POST METHOD /login - Error route')
})
/* index */
app.get('/images', isLogged, async (req, res) => {
    const images = await Image.find({});
    res.render('images/index', {images})
})
/* create */
app.get('/images/new', isLogged, (req, res) => {
    res.render('images/new');
})

/* TO-DO: redirect to the current user's profile (see route at the bottom) */
app.get('/profile', isLogged, async (req, res) => {
    // retrieve user from session
    if (req.session.user_id === 'admin')
        return res.redirect(`/admin`)
    const {user_id} = req.session
    const user = await User.findById(user_id)
    res.redirect(`/${user.username}`); // redirect to '/<username>'
})
app.get('/search', (req, res) => {
    res.render('search');
})
app.get('/register', whenLogged, (req, res) => {
    res.render('register', {msg: req.flash('taken')});
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
    const newUser = new User({username, email, password: hash})
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

app.post('/images', upload.array('image'), async (req, res) => {
    const {user_id} = req.session
    if (!user_id)
        return res.send('Error: trying to post image when not logged in')
    const user = await User.findById(user_id)
    const caption = req.body.caption
    // get url and filename from image stored in request (map creates an array; get first/only img)
    const newImg = req.files.map(f => ({url: f.path, filename: f.filename, caption, user}))[0]
    const image = new Image(newImg)
    user.images.push(image)
    await image.save()
    await user.save()
    res.redirect(`/images/${image._id}`)

})
/* show : in template => TO-DO! add permission to be able to delete comments */
app.get('/images/:id', isLogged, async (req, res) => {
    const image = await Image.findById(req.params.id).populate('comments')
    // check if image belongs to current user
    let permission = false
    const imageUserId = image.user.toString()
    if (imageUserId === req.session.user_id)
        permission = true
    // get image user
    const imgUser = await User.findById(imageUserId)
    // get current user
    const currentUser = await User.findById(req.session.user_id)
    res.render('images/show', {image, permission, imgUser, currentUser})
})
/* new comment post route */
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
    const {imageId, commentId} = req.params
    const image = await Image.findByIdAndUpdate(imageId, {$pull: {comments: commentId}})/* delete reference to comment */
    await Comment.findByIdAndDelete(req.params.commentId)
    res.redirect(`/images/${image._id}`)
})
/* update image */
app.get('/images/:id/edit', isLogged, async (req, res) => {
    const {user_id: user} = req.session
    const image = await Image.findById(req.params.id)
    // check if current user has permission to edit image
    const imgUser = image.user.toString()
    if (user === imgUser)
        return res.render('images/edit', {image});
    res.redirect('/') // redirect to homepage or login if user does not have permission
})
app.put('/images/:id', upload.array('image'), async (req, res) => {
    const {id} = req.params
    const caption = req.body.caption
    // if only the caption is edited
    if (!req.files[0]) {
        await Image.findByIdAndUpdate(id, {caption: req.body.caption})
        return res.redirect(`/images/${id}`)
    }
    // delete previous image
    const prevImg = await Image.findById(id)
    await cloudinary.uploader.destroy(prevImg.filename)
    // update with new image and new caption
    const updatedImg = req.files.map(f => ({url: f.path, filename: f.filename, caption}))[0]
    await Image.findByIdAndUpdate(id, {...updatedImg})
    res.redirect(`/images/${id}`)
})
/* delete image */
app.delete('/images/:id', async (req, res) => {
    const {user_id} = req.session
    if (!user_id)
        return res.send('Error: trying to delete image when not logged in')
    const {id} = req.params
    const {filename} = await Image.findById(id)
    await User.findByIdAndUpdate(user_id, {$pull: {images: id}})/* delete reference to image */
    if (filename)
        await cloudinary.uploader.destroy(filename) // delete image from cloud storage with filename
    await Image.findByIdAndDelete(id) // delete image from db
    res.redirect('/images')
})
/* to-do: user profile */
app.get('/:username', isLogged, async (req, res, next) => {
    if (req.params.username === 'admin')
        return res.send('user profile')
    const {username} = req.params
    const user = await User.findOne({username}).populate('images')
    if (user) {
        const userSession = await User.findById(req.session.user_id)
        let duplicateUser = false;
        if (userSession.username === user.username)
            duplicateUser = true
        let isBeingFollowed = false
        const users = await User.find({follows: {$in: [user._id]}})
        for (const u of users) {
            if (u.username === userSession.username) {
                isBeingFollowed = true;
                console.log(u.username);
                break;
            }
        }
        console.log(isBeingFollowed);
        console.log(userSession.username + userSession._id + ' follows ' + user.username + user._id + '? ' + isBeingFollowed)
        console.log(userSession.username + userSession._id + ' same as ' + user.username + user._id + '? ' + duplicateUser)
        return res.render('profile', {user, isBeingFollowed, duplicateUser})
    }
    // if no users found, send to error page
    next()
})
/* follow someone */
app.put('/follow', async (req, res) => {
    const userToFollow = await User.findById(req.body.userid)
    const userFollowing = await User.findById(req.session.user_id)
    if (userToFollow.username === userFollowing.username) {
        console.log('same person')
        res.redirect('/' + userFollowing.username)
    } else {
        let isBeingFollowed = false
        const users = await User.find({follows: {$in: [userToFollow._id]}})
        for (const u of users) {
            if (u.username === userFollowing.username) {
                isBeingFollowed = true;
                console.log(u);
                break;
            }
        }
        if (!isBeingFollowed) {
            await User.findByIdAndUpdate(userFollowing._id, {$push: {follows: userToFollow._id}})
            await User.findByIdAndUpdate(userToFollow._id, {$push: {followers: userFollowing._id}})
            console.log(userFollowing.username + ' is now following ' + userToFollow.username)
        } else {
            console.log('duplicate follow')
        }
        res.redirect('/' + userToFollow.username)
    }
    // res.send('Follow!')
})
/* unfollow someone */
app.put('/unfollow', async (req, res) => {
    const userToUnFollow = await User.findById(req.body.userid)
    const userUnFollowing = await User.findById(req.session.user_id)
    if (userToUnFollow.username === userUnFollowing.username) {
        console.log('same person')
        res.redirect('/' + userUnFollowing.username)
    } else {
        let isBeingFollowed = false
        const users = await User.find({follows: {$in: [userToUnFollow._id]}})
        for (const u of users) {
            if (u.username === userUnFollowing.username) {
                isBeingFollowed = true;
                console.log(u);
                break;
            }
        }
        if (isBeingFollowed) {
            await User.findByIdAndUpdate(userUnFollowing._id, {$pull: {follows: userToUnFollow._id}})
            await User.findByIdAndUpdate(userToUnFollow._id, {$pull: {followers: userUnFollowing._id}})
            console.log(userUnFollowing.username + ' has unfollowed ' + userToUnFollow.username)
        } else {
            console.log('has not followed yet')
        }
        res.redirect('/' + userToUnFollow.username)
    }
    // res.send('Follow!')
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
