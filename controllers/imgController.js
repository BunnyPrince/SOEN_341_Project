const Image = require('../models/image')
const User = require('../models/user')
const Comment = require('../models/comment')
const {cloudinary} = require('../cloudinary/cloudConfig')

const {
    createImage,
    deleteImage,
    editImageCaption,
    updateImage
} = require('../services/imgServices')
const { createComment, deleteComment } = require('../services/commentServices')


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
    const imgUser = await User.findById(imageUserId)
    const currentUser = await User.findById(req.session.user_id)
    res.render('images/fullpost', {image, permission, imgUser, currentUser})
}
const newImgForm = (req, res) => {
    res.render('images/upload')
}

const uploadNewPost = async (req, res) => {
    const image = await createImage(req, User, Image)
    return res.redirect(`/images/${image._id}`)

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
    if (!req.files[0])
        await editImageCaption(req, Image)
    else
        await updateImage(req, Image, cloudinary)
    res.redirect(`/images/${id}`)
}

const deletePost = async (req, res) => {
    await deleteImage(req, User, Image, cloudinary)
    res.redirect('/images')
}

// ------------------------------ Comments ------------------------------
const commentPost = async (req, res) => {
    const image = await createComment(req, Image, Comment)
    res.redirect(`/images/${image._id}`)
}
const deleteCommentPost = async (req, res) => {
    const image = await deleteComment(req, Image, Comment)
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
