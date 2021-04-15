const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Comment = require('./comment')

const ImageSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    url: String,
    filename: String,
    caption: String,
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: []
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// Middleware (delete cascade - deleting an image/post will delete all the comments)
ImageSchema.post('findOneAndDelete', async (deletedDoc) => {
    if (deletedDoc) {
        await Comment.deleteMany({
            _id: {
                $in: deletedDoc.comments
            }
        })
    }
    console.log('DELETED!', deletedDoc)
})

module.exports = mongoose.model('Image', ImageSchema)