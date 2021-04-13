const {listOfUsers} = require('../services/usrServices')
const mongoose = require('mongoose')
const User = require('../models/user')

const mockUser = {
    _id: mongoose.Types.ObjectId('60669044c2993ae9f290a42e') ,
    username: 'someoneElse',
    password: 'something',
    email: 'deffoFake@mail.uk',
    follows: [],
    followers: []
}
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

const mockRequest = {
    params: {
        //username: 'someoneElse'
        f: 'follows'
    },
    body: {
        userid: '60669044c2993ae9f290a42e'
    }
}

describe('listOfUsers (backend logic test)', () => {

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
        const currentUser = new User(mockUser)
        const newUser1 = new User(user1)
        await newUser1.save()
        const newUser2 = new User(user2)
        await newUser2.save()
        currentUser.follows = [newUser1, newUser2]
        await currentUser.save()

    })

    beforeEach(async () => {
    })

    afterAll(async () => {
        await User.deleteMany()
        await mongoose.connection.close()

    })
    it('`listOfUsers`: list of followers or follows', async () => {
        const {user, usersList} = await listOfUsers(mockRequest, User)
        expect(user._id.toString()).toEqual(mockRequest.body.userid)
        let i = 0
        usersList.forEach(user => {
            expect(user.username).toEqual(users[i].username)
            expect(user.password).toEqual(users[i].password)
            expect(user.email).toEqual(users[i].email)
            i++
        })
    })

})

