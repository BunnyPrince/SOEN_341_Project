const {createAccount} = require('../services/authServices')
const mongoose = require('mongoose')
const User = require('../models/user')
const bcrypt = require('bcrypt')

// mock requests
let usernameTaken = {
    body: {
        username: 'eyeshield2110',
        password: 'weak_password',
        email: 'eyeshield2110@mail.com'
    }
}
let validRequest = {
    body: {
        username: 'noah',
        email: 'original@email.com',
        password: 'hello'
    }
}

// mock user
let mockUser = {
    username: 'eyeshield2110',
    email: 'eyeshield2110@mail.mock',
    password: 'non-encrypted-psw',
    images: [],
    followers: [],
    follows: []
}

describe('Testing `createAccount` (business logic of POST /register route)', () => {
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
    beforeEach(async() => {
        await User.deleteMany()
        const user = new User(mockUser)
        await user.save()
    })


    afterAll(async () => {
        User.deleteMany()
        await mongoose.connection.close()

    })

    it('createAccount for user with taken username or email', async () => {
        let { result, msg } = await createAccount(usernameTaken, User, bcrypt)
        expect(result).toEqual('taken')
        expect(msg).toEqual('This username/email have already been used.')
    })

    it('createAccount for incomplete form submit', async () => {
        try {
            await createAccount(usernameTaken, User, bcrypt)
        }
        catch(e) {
            expect(e.toString())
                .toEqual('ValidationError: User validation failed: email: Email required')
        }
    })

    it('createAccount for valid new user', async () => {
        let { result, msg} = await createAccount(validRequest, User, bcrypt)
        expect(result).toEqual('successRegister')
        expect(msg).toEqual('Registration successful')
    })




})

