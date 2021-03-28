const User = require('../models/user');
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
        _id: '60438f9c0b84589e11a1cbc1'
    }
}

// create mock database
// insert dummy data from our seed files
// const {MongoClient} = require('mongodb')
const mongoose = require('mongoose')
const UserModel = require('../models/user')

// fake user
let mockUser = {
    username: 'john_smith',
    _id: '60438f9c0b84589e11a1cbc1',
    password: ''
}

describe('upload image to db', () => {
    let connection
    let db

    beforeAll(async () => {
        connection = await mongoose.connect(global.__MONGO_URI__,
            {
                useNewUrlParser: true,
                useCreateIndex: true
            })
        db = await connection.db(global.__MONGO_DB_NAME__)
        // insert

    })

    afterAll(async () => {
        await connection.close()
        await db.close()
    });

    it('should insert a doc into collection', async () => {
        const users = db.collection('users');

        const mockUser = {_id: 'some-user-id', name: 'John'};
        await users.insertOne(mockUser);

        const insertedUser = await users.findOne({_id: 'some-user-id'});
        expect(insertedUser).toEqual(mockUser);
    });
});

/*
const uploadNewPost = async (req, res) => {
    **refactor here** input request object
    const {user_id} = req.session
    if (!user_id)
        return res.send('Error: trying to post image when not logged in')
    const user = await User.findById(user_id)
    const caption = req.body.caption
    // get url and filename from image stored in request (map creates an array; get first/only img)
    const newImg = req.files.map(f => ({url: f.path, filename: f.filename, caption, user}))[0]

    **refactor end** output: either error, or image object
    const image = new Image(newImg)
    user.images.push(image)
    await image.save()
    await user.save()
    res.redirect(`/images/${image._id}`)
}
*/


