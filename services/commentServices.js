const createComment = async (req, Image, Comment) => {
    const image = await Image.findById(req.params.id)
    const comment = new Comment(req.body.comment)
    image.comments.push(comment)
    await comment.save()
    await image.save()
    return image
}

module.exports = {
    createComment
}
