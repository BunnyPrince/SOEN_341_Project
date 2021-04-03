const { follow } = require('../services/usrServices')
const mongoose = require('mongoose')
const User = require('../models/user')

const mockRequest = {
    body: {
        // user to follow
        userid: '60669044c2993ae9f290a459'
    },
    session: {
        // logged in user
        user_id: '60438f9c0b84589e11a1cbc1'
    }
}
const currentUser = {
    _id: mongoose.Types.ObjectId('60438f9c0b84589e11a1cbc1'),
    username: 'this_is_me',
    password: 'bad_password',
    email: 'dummy@mail.ca'
}

const userToFollow = {
    _id: mongoose.Types.ObjectId('60669044c2993ae9f290a459'),
    username: 'that_guy',
    password: 'bad_password',
    email: 'guys@hotmail.fr'
}

describe('follow (backend logic)', () => {

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
        let myUsr = new User(currentUser)
        await myUsr.save()
        let newUserToFollow = new User(userToFollow)
        await newUserToFollow.save()
    })

    afterAll(async () => {
        await User.deleteMany()
        await mongoose.connection.close()

    })
    it('Make this_is_me follow that_guy', async () => {
        await follow(mockRequest, User)

       const fetchedCurrentUser = await User.findById(currentUser._id)
        const {follows} = fetchedCurrentUser

       const fetchedUserFollowed = await User.findById(userToFollow._id)
        const {followers} = fetchedUserFollowed

        expect(follows[0]._id).toStrictEqual(fetchedUserFollowed._id) // expect that_guy
        expect(followers[0]._id).toStrictEqual(fetchedCurrentUser._id) // expect this_is_me
    })

})


