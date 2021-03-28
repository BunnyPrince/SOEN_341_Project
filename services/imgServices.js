// refactoring the logic of uploadNewPost
const createImage = async (req, User, Image) => {
    const {user_id} = req.session
    // console.log('user_id', user_id)
    if (!user_id)
        return undefined
    const user = await User.findById(user_id)
    const caption = req.body.caption
    let newImg = req.files.map(f => ({
        url: f.path,
        filename: f.filename,
        caption,
        user
    }))[0]
    let image = new Image(newImg)
    user.images.push(image)
    await image.save()
    await user.save()
    return image
}

module.exports = {
    createImage
}
