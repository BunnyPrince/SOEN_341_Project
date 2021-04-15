const {MongoClient} = require('mongodb')
const mongoose = require('mongoose')
const User = require('../models/user')
const Image = require('../models/image')
const {createImage} = require('../services/imgServices')

// mock user
let mockUser = {
    username: 'john_smith',
    _id: mongoose.Types.ObjectId('60438f9c0b84589e11a1cbc1'),
    email: 'john@mail.mock',
    password: 'non-encrypted-psw',
    images: [],
    followers: [],
    follows: []
}

// mock request
const request = {
    session: {
        userId: '60438f9c0b84589e11a1cbc1'
    },
    params: '',
    body: {
        // data from the upload form
        caption: 'Awesome vacation in Europe!'
    },
    files: [
        {
            fieldname: 'image',
            path: 'https://res.cloudinary.com/soen341teamb8/image/upload/v1616919798/ig_photos/jogc6anr8sx4mv1z1wjy.jpg',
            filename: 'ig_photos/jogc6anr8sx4mv1z1wjy'
        }
    ]
}
// expected new img
const expectedImg = {
    url: 'https://res.cloudinary.com/soen341teamb8/image/upload/v1616919798/ig_photos/jogc6anr8sx4mv1z1wjy.jpg',
    filename: 'ig_photos/jogc6anr8sx4mv1z1wjy',
    caption: 'Awesome vacation in Europe!',
    user: {
        username: 'john_smith',
        email: 'john@mail.mock',
        _id: mongoose.Types.ObjectId('60438f9c0b84589e11a1cbc1'),
        images: []
    }
}

describe('Testing `createImage`, service function (backend upload logic)', () => {
    let connection
    let db

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
        const user = new User(mockUser)
        await user.save()
    })

    afterAll(async () => {
        await Image.deleteMany()
        await User.deleteMany()
        await mongoose.connection.close()

    })

    it('fetch mock user john smith', async () => {
        // fetch
        const {username, email, password, _id} = await User.findOne({username: 'john_smith'})
        expect(username).toEqual(mockUser.username)
        expect(email).toEqual(mockUser.email)
        expect(password).toEqual(mockUser.password)
        expect(_id).toEqual(mockUser._id)
    })


    it('createImage test', async () => {
        await createImage(request, User, Image)
        let {filename, url, caption, user} = await Image.findOne({filename: expectedImg.filename})
        expect(filename).toEqual(expectedImg.filename)
        expect(url).toEqual(expectedImg.url)
        expect(caption).toEqual(expectedImg.caption)
        expect(user._id).toEqual(expectedImg.user._id)

    })
})



