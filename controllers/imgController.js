const Image = require('../models/image')
const User = require('../models/user')
const Comment = require('../models/comment')

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
const editPostForm = async (req, res) => {
    const {user_id: user} = req.session
    const image = await Image.findById(req.params.id)
    // check if current user has permission to edit image
    const imgUser = image.user.toString()
    if (user === imgUser)
        return res.render('images/edit', {image});
    res.redirect('/') // redirect to homepage or login if user does not have permission
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
    editPostForm,
    commentPost,
    deleteCommentPost
}
