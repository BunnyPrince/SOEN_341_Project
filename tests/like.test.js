const {like} = require('../services/likeServices')
const mongoose = require('mongoose')
const Image = require('../models/image')
const User = require('../models/user')
const mockRequest = {
    body: {
        // image to like
        image: '60669044c2993ae9f290a452'
    },
    session: {
        // logged in user
        userId: '60669044c2993ae9f290a454'
    }
}
const mockUser = {
    _id: mongoose.Types.ObjectId('60669044c2993ae9f290a454'),
    username: 'Andrew',
    password: 'udem2021',
    email: 'andy@mail.ca'
}

const mockImage = {
    _id: mongoose.Types.ObjectId('60669044c2993ae9f290a452'),
    caption: 'Some image to like!'
}

describe('like (backend logic)', () => {

    beforeAll(async () => {
        // connect
        await mongoose.connect(global.__MONGO_URI__,
            {useNewUrlParser: true, useUnifiedTopology: true},
            (err) => {
                if (err) {
                    console.error(err)
                    process.exit(1)
                }
            })
    })

    beforeEach(async () => {
        await User.deleteMany()
        await Image.deleteMany()
        let myUsr = new User(mockUser)
        let myImg = new Image(mockImage)
        await myUsr.save()
        await myImg.save()
    })

    afterAll(async () => {
        await User.deleteMany()
        await Image.deleteMany()
        await mongoose.connection.close()

    })


    it('Like a post', async () => {
        const imgBeforeLike = await Image.findById(mockRequest.body.image)
        expect(imgBeforeLike.likes.length).toBe(0)
        await like(mockRequest, Image)
        const imgAfterLike = await Image.findById(mockRequest.body.image)
        // expect(fetchedImg.likes.length).toBe(1)
        expect(imgAfterLike.likes[0]._id).toStrictEqual(mockUser._id)
        expect(imgAfterLike.likes.length).toBe(1)
    })

})
