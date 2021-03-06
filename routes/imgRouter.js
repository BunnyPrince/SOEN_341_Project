if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
} // current env: "development"
const express = require('express')
const router = express.Router()
const Image = require('../models/image')
const Comment = require('../models/comment')
const User = require('../models/user')
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const {CloudinaryStorage} = require('multer-storage-cloudinary')
const ExpressError = require('../.utils/ExpressError')
const asyncErr = require('../.utils/asyncErr')
const Joi = require('joi') // schema validation
    // controllers
const imgController = require('../controllers/imgController')
    // .utils
// const isLogged = require('../.utils/isLogged')
// const whenLogged = require('../.utils/whenLogged')

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
/* ===================================================================================*/

router.get('/', asyncErr(imgController.explore))

router.get('/new', imgController.newImgForm)

router.post('/', upload.array('image'), asyncErr(async (req, res) => {
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
router.get('/:id', asyncErr(imgController.fullPost))

router.get('/:id/edit', asyncErr(imgController.editPostForm))

router.put('/:id', upload.array('image'), asyncErr(async (req, res) => {
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
router.delete('/:id', asyncErr(async (req, res) => {
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
}))

// Comments
router.post('/:id/comments', asyncErr(imgController.commentPost))
router.delete('/:imageId/comments/:commentId', asyncErr(imgController.deleteCommentPost))

module.exports = router
