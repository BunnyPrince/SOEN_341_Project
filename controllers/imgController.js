const Image = require('../models/image')
const User = require('../models/user')
const Comment = require('../models/comment')
const { cloudinary } = require('../cloudinary/cloudConfig')

const explore = async (req, res) => {
    const images = await Image.find({}).sort({createdAt: 'desc'});
    res.render('images/explore', {images})
}
const fullPost = async (req, res) => {
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
}
const newImgForm = (req, res) => {
    res.render('images/upload')
}
const uploadNewPost = async (req, res) => {
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
}
const editPostForm = async (req, res) => {
    const {user_id: user} = req.session
    const image = await Image.findById(req.params.id)
    // check if current user has permission to edit image
    const imgUser = image.user.toString()
    if (user === imgUser)
        return res.render('images/edit', {image});
    res.redirect('/') // redirect to homepage or login if user does not have permission
}
const updatePost = async (req, res) => {
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
}
const deletePost = async (req, res) => {
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
}

// ------------------------------ Comments ------------------------------
const commentPost = async (req, res) => {
    const image = await Image.findById(req.params.id)
    const comment = new Comment(req.body.comment)
    image.comments.push(comment)
    await comment.save()
    await image.save()
    res.redirect(`/images/${image._id}`)
}
const deleteCommentPost = async (req, res) => {
    const {imageId, commentId} = req.params
    const image = await Image.findByIdAndUpdate(imageId, {$pull: {comments: commentId}})/* delete reference to comment */
    await Comment.findByIdAndDelete(req.params.commentId)
    res.redirect(`/images/${image._id}`)
}

module.exports = {
    explore,
    fullPost,
    newImgForm,
    uploadNewPost,
    editPostForm,
    updatePost,
    deletePost,
    commentPost,
    deleteCommentPost
}
