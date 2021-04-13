const {unfollow} = require('../services/usrServices')
const mongoose = require('mongoose')
const User = require('../models/user')

const mockRequest = {
    body: {
        // user to unfollow
        userid: '60669044c2993ae9f290a430'
    },
    session: {
        // logged in user
        user_id: '60669044c2993ae9f290a42c'
    }
}
const currentUser = {
    _id: mongoose.Types.ObjectId('60669044c2993ae9f290a42c'),
    username: 'this_is_me',
    password: 'bad_password',
    email: 'dummy@mail.ca'
}

const userToUnfollow = {
    _id: mongoose.Types.ObjectId('60669044c2993ae9f290a430'),
    username: 'that_guy',
    password: 'bad_password',
    email: 'guys@hotmail.fr'
}

describe('unfollow (backend logic)', () => {

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
        let newUserToFollow = new User(userToUnfollow)
        // make myUsr follow newUserToFollow
        myUsr.follows.push(newUserToFollow)
        newUserToFollow.followers.push(myUsr)
        await myUsr.save()
        await newUserToFollow.save()
    })

    afterAll(async () => {
        await User.deleteMany()
        await mongoose.connection.close()

    })


    it('Make this_is_me unfollow that_guy', async () => {
        // confirm that this_is_me is following that_guy
        let fetchedCurrentUser = await User.findById(currentUser._id)
        let {follows} = fetchedCurrentUser

        let fetchedUserFollowed = await User.findById(userToUnfollow._id)
        let followers = fetchedUserFollowed.followers

        expect(follows[0]._id).toStrictEqual(fetchedUserFollowed._id) // expect that_guy
        expect(followers[0]._id).toStrictEqual(fetchedCurrentUser._id) // expect this_is_me

        // perform unfollow
        await unfollow(mockRequest, User)

        fetchedCurrentUser = await User.findById(currentUser._id)
        follows = fetchedCurrentUser.follows

        const fetchedUserUnfollowed = await User.findById(userToUnfollow._id)
        followers = fetchedUserUnfollowed.followers

        expect(follows.length).toBe(0)
        expect(followers.length).toBe(0)
    })

})
