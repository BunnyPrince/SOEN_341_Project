const mongoose = require('mongoose')
const Image = require('../models/image') /* exporting image schema */
const Comment = require('../models/comment')
const User = require('../models/user')
const userSeeds = require('./userSeeds') /* users to fill in db */
const imageSeeds = require('./imageSeeds') /* images to fill db */
// cloudinary
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const {CloudinaryStorage} = require('multer-storage-cloudinary')
/* ============================== cloudinary, multer configuration ==========================*/
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
/* ------------------------------------------------ MongoDB connection ------------------------------------------------ */
let db_name = 'ig_db'

mongoose.connect('mongodb://localhost:27017/' + db_name, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected. Seeding will start ...");
});

/* --------------------------------- Seeding db and closing --------------------------------- */
const seedDB = async () => {
    await Comment.deleteMany({})
    const imgs = await Image.find()
    for (let i of imgs) {
        if (i.filename) {
            await cloudinary.uploader.destroy(i.filename)
        }
        await i.save()
    }
    await Image.deleteMany({})
    await User.deleteMany({})
    for (let i = 0; i < userSeeds.length; i++) {
        const user = new User(userSeeds[i])
        // retrieve arr of img for this user
        const images = imageSeeds[i]
        // create an array of images for this user
        let thisUserImg = images.map(image => ({
            url: image.url,
            caption: image.caption,
            user
        }))
        // create images, save to db and to users
        for (let img of thisUserImg) {
            const newImg = new Image(img)
            user.images.push(newImg)
            await newImg.save()
        }
        await user.save()
    }

}

/* Actual seeding ... */
seedDB().then(() => {
    mongoose.connection.close()
        .then(() => { console.log("Seeding done.") });
})
