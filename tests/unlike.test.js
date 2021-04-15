const {unlike} = require('../services/likeServices')
const mongoose = require('mongoose')
const Image = require('../models/image')
const User = require('../models/user')

const mockRequest = {
    body: {
        // image to like
        image: ''
    },
    session: {
        // logged in user
        userId: ''
    }
}
const mockUser = {
    username: 'Matt',
    password: 'matt2021',
    email: 'matt@mail.ca'
}

const mockImage = {
    caption: 'Some image to like!'
}

describe('unlike (backend logic)', () => {

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
        // setup request
        mockRequest.body.image = myImg._id.toString()
        mockRequest.session.userId = myUsr._id.toString()
        // make user like the image
        myImg.likes.push(myUsr)
        await myUsr.save()
        await myImg.save()
    })

    afterAll(async () => {
        await User.deleteMany()
        await Image.deleteMany()
        await mongoose.connection.close()

    })


    it('unLike a post', async () => {
        const imgBeforeUnlike = await Image.findById(mockRequest.body.image)
        expect(imgBeforeUnlike.likes.length).toBe(1)

        await unlike(mockRequest, Image)
        const imgAfterUnlike = await Image.findById(mockRequest.body.image)

        expect(imgAfterUnlike.likes.length).toBe(0)
    })

})
