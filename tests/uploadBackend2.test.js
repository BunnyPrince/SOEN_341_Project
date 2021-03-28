// Dummy test file: example of setup to test the service layer functions (logic of controllers)

const mongoose = require('mongoose')
const UserModel = require('../models/user')
const userData = {
    username: 'TekLoon',
    email: 'aa@aa',
    password: "fake",
    follows: [],
    followers: [],
    images: [],
    _id: mongoose.Types.ObjectId('60438f9c0b84589e11a1cbc3')
}

describe('User Model Test', () => {

    // Connect to the MongoDB Memory Server by using mongoose.connect
    beforeAll(async () => {
        await mongoose.connect(global.__MONGO_URI__,
            {useNewUrlParser: true, useUnifiedTopology: true},
            (err) => {
                if (err) {
                    console.error(err)
                    process.exit(1)
                }
            })

        const validUser = new UserModel(userData)
        await validUser.save()
    })

    afterAll(async () => {
            await UserModel.deleteMany()
            await mongoose.connection.close()
        }
    )


    it('create & save user successfully', async () => {

        const insertedUser = await UserModel.findOne({username: 'TekLoon'})
        expect(insertedUser.username).toEqual(userData.username)

        // Object Id should be defined when successfully saved to MongoDB.
        /*expect(savedUser._id).toBeDefined()
        expect(savedUser.username).toBe(userData.username)
        expect(savedUser.email).toBe(userData.email)
        expect(savedUser.password).toBe(userData.password)*/


    })

})
