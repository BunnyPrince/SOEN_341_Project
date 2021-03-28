const createComment = async (req, Image, Comment) => {
    const image = await Image.findById(req.params.id)
    const comment = new Comment(req.body.comment)
    image.comments.push(comment)
    await comment.save()
    await image.save()
    return image
}

const deleteComment = async (req, Image, Comment) => {
    const {imageId, commentId} = req.params
    // This deletes the reference to the comment in image
    const image = await Image.findByIdAndUpdate(imageId, {$pull: {comments: commentId}})
    await Comment.findByIdAndDelete(req.params.commentId)
    return image
}

module.exports = {
    createComment,
    deleteComment
}
