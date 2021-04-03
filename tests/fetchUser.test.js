const {fetchLoginUser} = require('../services/authServices')
const {checkoutUser} = require('../services/usrServices')
const mongoose = require('mongoose')
const User = require('../models/user')

const mockUser = {
    _id: mongoose.Types.ObjectId('60438f9c0b84589e11a1cbc1') ,
    username: 'someoneElse',
    password: 'something',
    email: 'deffoFake@mail.uk',
    follows: []
}

const mockRequest = {
    params: {
        username: 'someoneElse'
    },
    session: {
        user_id: '60438f9c0b84589e11a1cbc1'
    }
}

describe('fetchUser (backend logic)', () => {

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
        let usr = new User(mockUser)
        await usr.save()
    })

    afterAll(async () => {
        await mongoose.connection.close()

    })
    it('`fetchLoginUser`: business function fetch current user profile', async () => {
        let fetchedUser = await fetchLoginUser(mockRequest, User)
        expect(fetchedUser.username).toEqual(mockUser.username)
        expect(fetchedUser.password).toEqual(mockUser.password)
        expect(fetchedUser.email).toEqual(mockUser.email)
        expect(fetchedUser._id).toEqual(mockUser._id)
    })

    it('`checkoutUser`: business function fetch user through address bar', async () => {
        let {user, isBeingFollowed, duplicateUser} = await checkoutUser(mockRequest, User)
        expect(user.username).toEqual(mockUser.username)
        expect(isBeingFollowed).toEqual(false)
        expect(duplicateUser).toEqual(true)
    })




})

