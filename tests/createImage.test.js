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
        user_id: '60438f9c0b84589e11a1cbc1'
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
        /*connection = await MongoClient.connect(global.__MONGO_URI__,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
        db = await connection.db(global.__MONGO_DB_NAME__)
*/
        //alt connect
        await mongoose.connect(global.__MONGO_URI__,
            {useNewUrlParser: true, useUnifiedTopology: true},
            (err) => {
                if (err) {
                    console.error(err)
                    process.exit(1)
                }
            })

        // insert
        /*        const user = await new User(mockUser)
                let users = db.collection('users')
                users.insertOne(user)*/

        // alternate insert
        const user = new User(mockUser)
        await user.save()

    })

    afterEach(async() => {
    })

    afterAll(async () => {
        /*     await connection.close()
             await db.close()*/

        //alt disconnect

        Image.deleteMany()
        User.deleteMany()
        await mongoose.connection.close()

    })

    /*
    it('should insert a doc into collection', async () => {

        // const users = await db.collection('users')


        const fakeUser = {_id: 'some-user-id', username: 'jim', email: 'jim@office.us', password: 'password'};
        await users.insertOne(fakeUser)

        const insertedUser = await users.findOne({_id: 'some-user-id'})
        expect(insertedUser).toEqual(fakeUser)

    })
    */

    it('fetch mock user john smith', async () => {
        // fetch
        /*        const users = await db.collection('users')
                const user = await users.findOne({username: 'john_smith'})
                expect(user).toEqual(mockUser)*/

        // alternate fetch
        const {username, email, password, _id} = await User.findOne({username: 'john_smith'})
        expect(username).toEqual(mockUser.username)
        expect(email).toEqual(mockUser.email)
        expect(password).toEqual(mockUser.password)
        expect(_id).toEqual(mockUser._id)
    })


    it('createImage fails', async() => {
        await createImage(request, User, Image)
        let { filename, url, caption, user} = await Image.findOne({filename: expectedImg.filename})
        expect(filename).toEqual(expectedImg.filename)
        expect(url).toEqual(expectedImg.url)
        expect(caption).toEqual(expectedImg.caption)
        expect(user._id).toEqual(expectedImg.user._id)


    })


})


