const {loginToAccount} = require('../services/authServices')
const mongoose = require('mongoose')
const User = require('../models/user')
const bcrypt = require('bcrypt')

// mock request
let validRequest = {
    body: {
        username: 'maria',
        password: 'non-encrypted-psw'
    }
}

const encryptPsw = async () => {
    return await bcrypt.hash('non-encrypted-psw', 12)
}

// mock user
let mockUser = {
    username: 'maria',
    email: 'maria@mail.mock',
    password: '',
    images: [],
    followers: [],
    follows: []
}

describe('Testing of backend logic of `loginToAccount`', () => {

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
        mockUser.password = await encryptPsw()
        const user = new User(mockUser)
        await user.save()
    })
    beforeEach(async() => {
        await User.deleteMany()
        const user = new User(mockUser)
        await user.save()
    })

    afterAll(async () => {
        await User.deleteMany()
        await mongoose.connection.close()

    })
    it('loginToAccount: testing fetching "maria"', async () => {
        const john = await User.findOne({username: 'maria'})
        const validPsw = await bcrypt.compare(validRequest.body.password, john.password)
        expect(validPsw).toEqual(true)
    })

    it('loginToAccount as user "maria"', async () => {
        const {result, msg} = await loginToAccount(validRequest, User, bcrypt)
        expect({result, msg}).toEqual({"msg": "Successful login", "result": "success"})

    })


})

