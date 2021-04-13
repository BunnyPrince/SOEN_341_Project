const {showFeed} = require('../services/authServices')
const mongoose = require('mongoose')
const User = require('../models/user')
const Image = require('../models/image')

// create dummies: 3 users and 4 images
const currentUser = {
    username: 'me',
    password: 'something',
    email: 'idk@mail.uk',
    follows: []
}
let myUser

const user1 = {
    username: 'abba',
    password: 'motdepasse',
    email: 'abb@email.com',
    images: []
}
const user2 = {
    username: 'tom',
    password: 'password111',
    email: 'tom@email.com',
    images: []
}
const users = [user1, user2]
const image1 = {
    user: '',
    caption: 'some fake caption haha'
}
const image2 = {
    user: '',
    caption: 'another fake caption'
}
const image3 = {
    user: '',
    caption: 'i dont know'
}
const image4 = {
    user: '',
    caption: 'hii'
}
const requestImages = [image1, image2, image3, image4]

// init dummy request
let request = ''

describe('Testing of data of the feed', () => {

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

        myUser = new User(currentUser)
        const newUser1 = new User(user1)
        const newUser2 = new User(user2)

        image1.user = newUser1
        const newImage1 = new Image(image1)
        await newImage1.save()
        newUser1.images.push(newImage1)

        image2.user = newUser1
        const newImage2 = new Image(image2)
        await newImage2.save()
        newUser1.images.push(newImage2)


        image3.user = newUser2
        const newImage3 = new Image(image3)
        await newImage3.save()
        newUser2.images.push(newImage3)

        image4.user = newUser2
        const newImage4 = new Image(image4)
        await newImage4.save()
        newUser2.images.push(newImage4)


        await newUser1.save()
        await newUser2.save()

        myUser.follows = [newUser1, newUser2]
        await myUser.save()

        // mock request
        request = {
            session: {
                user_id: myUser._id.toString()
            }
        }
    })

    afterAll(async () => {
        await Image.deleteMany()
        await User.deleteMany()
        await mongoose.connection.close()

    })
    it('showFeed', async () => {
        let {currentUser, feedImages} = await showFeed(request, User, Image)
        expect(currentUser.username).toEqual(myUser.username)
        let i = 0
        feedImages.forEach(image => {
            expect(image.caption).toEqual(requestImages[i].caption)
            i++
        })

    })

})
