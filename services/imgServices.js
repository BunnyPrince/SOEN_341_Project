// Functions that handles business logic inside the imgController

const createImage = async (req, User, Image) => {
    const {user_id} = req.session
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

const deleteImage = async (req, User, Image, cloudinary) => {
    const {user_id} = req.session
    const {id} = req.params
    const {filename} = await Image.findById(id)
    // delete reference to the image
    await User.findByIdAndUpdate(user_id, {$pull: {images: id}})
    if (filename) {
        // delete image from cloud storage
        await cloudinary.uploader.destroy(filename)
    }
    // delete image from db
    await Image.findByIdAndDelete(id)
}

const editImageCaption = async (req, Image) => {
    const {id} = req.params
    const {caption} = req.body
    await Image.findByIdAndUpdate(id, {caption})
}

const updateImage = async (req, Image, cloudinary) => {
    const {id} = req.params
    const {caption} = req.body
    // delete previous image
    const prevImg = await Image.findById(id)
    await cloudinary.uploader.destroy(prevImg.filename)
    // update with new image and new caption
    const updatedImg = req.files.map(f => ({url: f.path, filename: f.filename, caption}))[0]
    await Image.findByIdAndUpdate(id, {...updatedImg})
}

module.exports = {
    createImage,
    deleteImage,
    editImageCaption,
    updateImage
}
