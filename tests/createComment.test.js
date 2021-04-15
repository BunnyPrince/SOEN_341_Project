const {createComment} = require('../services/commentServices')
const mongoose = require('mongoose')
const Image = require('../models/image')
const Comment = require('../models/comment')

// mock user

// mock request
const request = {
    params: {
        id: '60438f9c0b84589e11a1cbb9'
    },
    body: {
        comment: {
            username: 'john_smith',
            comment: 'I love this pic!!'
        }
    }

}

// mock database image
const mockImage = {
    _id: mongoose.Types.ObjectId('60438f9c0b84589e11a1cbb9'),
    user: mongoose.Types.ObjectId('60438f9c0b84589e11a1cbb6'),
    comments: []
}

// expected image
const expectedImg = {
    _id: mongoose.Types.ObjectId('60438f9c0b84589e11a1cbb9'),
    user: mongoose.Types.ObjectId('60438f9c0b84589e11a1cbb6'),
    comments: [
        {
            username: 'john_smith',
            comment: 'I love this pic!!'
        }
    ]
}

describe('Testing `createComment`',  () => {

    beforeAll(async () => {

        //alt connect
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
        await Image.deleteMany()
        const image = new Image(mockImage)
        await image.save()
    })

    afterAll(async () => {
        await Comment.deleteMany()
        await Image.deleteMany()
        await mongoose.connection.close()

    })


    it('createComment with a valid comment', async () => {
        await createComment(request, Image, Comment)
        const img = await Image.findById('60438f9c0b84589e11a1cbb9').populate('comments')
        const {comments} = img
        expect(comments[0].username).toEqual(expectedImg.comments[0].username)
        expect(comments[0].comment).toEqual(expectedImg.comments[0].comment)
    })


})
