const {deleteImage} = require('../services/imgServices')
const mongoose = require('mongoose')
const Image = require('../models/image')
const User = require('../models/user')
const cloudinary = require('../cloudinary/cloudConfig')

// mock request
const request = {
    session: {
        user_id: '60438f9c0b84589e11a1cbb6'
    },
    params: {
        // image id to delete
        id: '60438f9c0b84589e11a1cbb9'
    }

}

// mock user
const mockUser = {
    _id: mongoose.Types.ObjectId('60438f9c0b84589e11a1cbb6'),
    username: 'john_smith',
    email: 'john@mail.fake',
    password: 'deffoFake'
}

// mock database image
const mockImage = {
    _id: mongoose.Types.ObjectId('60438f9c0b84589e11a1cbb9'),
    user: mongoose.Types.ObjectId('60438f9c0b84589e11a1cbb6'),
    comments: []
}

describe('Testing `deleteImage`', () => {

    beforeAll(async () => {
        await mongoose.connect(global.__MONGO_URI__,
            {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false},
            (err) => {
                if (err) {
                    console.error(err)
                    process.exit(1)
                }
            })
        const user = new User(mockUser)
        const img = new Image(mockImage)
        user.images.push(img)
        await user.save()
        await img.save()

    })

    afterAll(async () => {
        await Comment.deleteMany()
        await Image.deleteMany()
        await User.deleteMany()
        await mongoose.connection.close()

    })


    it('deleteImage', async () => {
        await deleteImage(request, User, Image, cloudinary)
        let img = await Image.findById(request.params.id)
        expect(img).toBe(null)
    })


})
