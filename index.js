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
const Image = require('./models/image')
const Comment = require('./models/comment')
const User = require('./models/user')
const bcrypt = require('bcrypt')
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const {CloudinaryStorage} = require('multer-storage-cloudinary')
// Routers
// const imgRouter = require('./routes/imgRouter')
// Error handling
const ExpressError = require('./.utils/ExpressError')
const asyncErr = require('./.utils/asyncErr')
const Joi = require('joi') // schema validation
// Other utils

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

/* ==================================================== RESTFUL ROUTES & MONGOOSE CRUD  ====================================================  */

/* profile page (redirect to login if not logged in) */
app.get('/', asyncErr(async (req, res) => {
    if (req.session.user_id) {
        let {follows} = await User.findById(req.session.user_id)
        let feedImgs = await Image.find({user: {$in: follows}})
        // console.log(feedImgs)
        return res.render('feed', {feedImgs});
    }
    res.render('login', {
        msg:
            [req.flash('failedLogin'), req.flash('successRegister')]
    })
}))
app.post('/login', asyncErr(async (req, res) => {
    const {username, password} = req.body
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
        return res.redirect('/')
    }
    console.log('Failed login')
    req.flash('failedLogin', "Wrong username and/or password.")
    res.redirect('/')

}))
app.get('/search', (req, res) => {
    res.render('search')
})
app.get('/register', whenLogged, (req, res) => {
    res.render('register', {msg: req.flash('taken')})
})
app.post('/register', asyncErr(async (req, res) => {
    const {username, email, password} = req.body
    const db_user = await User.findOne({username})
    const db_email = await User.findOne({email})
    if (db_user || db_email) {
        req.flash('taken', 'This username/email have already been used.')
        return res.redirect('/register')
    }
    // hash password before storing
    const hash = await bcrypt.hash(password, 12)

    // create user if data valid, and redirect to login
    const newUser = new User({username, email, password: hash})
    await newUser.save()
    console.log(newUser)
    req.flash('successRegister', 'Registration successful!')
    res.redirect('/')

}))
app.get('/profile', isLogged, asyncErr(async (req, res) => {
    const {user_id} = req.session
    const user = await User.findById(user_id)
    res.redirect(`/${user.username}`); // redirect to '/<username>'
}))
app.post('/logout', (req, res) => {
    req.session.user_id = null
    req.session.destroy() // completely any information stored in session
    res.redirect('/')
})
/* ===== images routes =====*/
// app.use('/images', imgRouter)
/* explore */
app.get('/images', isLogged, asyncErr(async (req, res) => {
    const images = await Image.find({}).sort({createdAt: 'desc'});
    res.render('images/explore', {images})
}))
/* get and post routes for UPLOAD */
app.get('/images/new', isLogged, (req, res) => {
    res.render('images/upload');
})
app.post('/images', upload.array('image'), asyncErr(async (req, res) => {
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

}))
/* show full post */
app.get('/images/:id', isLogged, asyncErr(async (req, res) => {
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
    res.render('images/fullpost', {image, permission, imgUser, currentUser})
}))
/* get and put routes to update image */
app.get('/images/:id/edit', isLogged, asyncErr(async (req, res) => {
    const {user_id: user} = req.session
    const image = await Image.findById(req.params.id)
    // check if current user has permission to edit image
    const imgUser = image.user.toString()
    if (user === imgUser)
        return res.render('images/edit', {image});
    res.redirect('/') // redirect to homepage or login if user does not have permission
}))
app.put('/images/:id', upload.array('image'), asyncErr(async (req, res) => {
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
}))
/* delete image */
app.delete('/images/:id', asyncErr(async (req, res) => {
    const {user_id} = req.session
    if (!user_id)
        return res.send('Error: trying to delete image when not logged in')
    const {id} = req.params
    const {filename} = await Image.findById(id)
    await User.findByIdAndUpdate(user_id, {$pull: {images: id}}) /* delete reference to image */
    if (filename)
        await cloudinary.uploader.destroy(filename) // delete image from cloud storage with filename
    await Image.findByIdAndDelete(id) // delete image from db
    res.redirect('/images')
}))
/* new comment post route */
app.post('/images/:id/comments', asyncErr(async (req, res) => {
    const image = await Image.findById(req.params.id)
    const comment = new Comment(req.body.comment)
    image.comments.push(comment)
    await comment.save()
    await image.save()
    res.redirect(`/images/${image._id}`)
}))
/* delete comment */
app.delete('/images/:imageId/comments/:commentId', asyncErr(async (req, res) => {
    const {imageId, commentId} = req.params
    const image = await Image.findByIdAndUpdate(imageId, {$pull: {comments: commentId}}) /* delete reference to comment */
    await Comment.findByIdAndDelete(req.params.commentId)
    res.redirect(`/images/${image._id}`)
}))
/* ====== end images router ====== */
/* user profile */
app.get('/:username', isLogged, asyncErr(async (req, res, next) => {
    const {username} = req.params
    const user = await User.findOne({username}).populate('images')
    if (!user) // if profile page does not exist, send to error page
        return next()
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
    // console.log(isBeingFollowed);
    // console.log(userSession.username + userSession._id + ' follows ' + user.username + user._id + '? ' + isBeingFollowed)
    // console.log(userSession.username + userSession._id + ' same as ' + user.username + user._id + '? ' + duplicateUser)
    return res.render('profile', {user, isBeingFollowed, duplicateUser, overlay: false, usersList: []})

}))
/* Show follows and followers list (same route) */
app.post('/:username/:f', asyncErr(async (req, res, next) => {
    const {f} = req.params
    if (f !== 'followers' && f !== 'follows')
        return next()
    const user = await User.findById(req.body.userid).populate('images')
    console.log(user[f])
    const usersList = await User.find({_id: {$in: user[f]}})
    return res.render('profile', {
        user,
        duplicateUser: req.body.duplicateUser,
        isBeingFollowed: req.body.isBeingFollowed,
        overlay: true,
        usersList
    })

}))
/* follow someone */
app.put('/follow', asyncErr(async (req, res) => {
    const userToFollow = await User.findById(req.body.userid)
    const sessionUser = await User.findById(req.session.user_id)

    // Prevent following someone multiple times
    for (let u of userToFollow.followers) {
        if (u.username === sessionUser.username) {
            console.log('duplicate follow')
            return res.redirect('/' + userToFollow.username)
        }
    }
    sessionUser.follows.push(userToFollow)
    await sessionUser.save()
    userToFollow.followers.push(sessionUser)
    await userToFollow.save()

    console.log(sessionUser.username + ' is now following ' + userToFollow.username)
    res.redirect('/' + userToFollow.username)

}))
/* unfollow someone */
app.put('/unfollow', asyncErr(async (req, res) => {
    const userToUnfollow = { ... req.body }
    const sessionUser = req.session.user_id

    await User.findByIdAndUpdate(sessionUser, {$pull: {follows: userToUnfollow.userid}})
    await User.findByIdAndUpdate(userToUnfollow.userid, {$pull: {followers: sessionUser}})
    console.log(sessionUser + ' has unfollowed ' + userToUnfollow.username)
    return res.redirect('/' + userToUnfollow.username)

}))

/* ------------------------------------------------ Error Handling ------------------------------------------------ */
// Testing the error route
app.all('*', (req, res, next) => {
   /* res.send('<div style=margin:100px auto;">' +
        '<h1>404: page not found.</h1>' +
        '</div>')
    */
    next(new ExpressError('404', 'Page Not Found'))
})
// Error template
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
