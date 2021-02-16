const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Image = require('./image')

const UserSchema = new Schema({
    username: {
        type: String,
        required: [true, "Username required"]
    },
    password: {
        type: String,
        required: [true, "Password required"]
    },
    email: {
        type: String,
        required: [true, "Email required"]
    },
    images: [{
        type: Schema.Types.ObjectId,
        ref: 'Image'
    }],
    follows: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    pfp: {
        url: String,
        filename: String
    }
})

// middleware: verify user login


// deleting users will delete user images
// Middleware (delete cascade - deleting an image/post will delete all the comments)
UserSchema.post('findOneAndDelete', async function(deletedDoc) {
    if (deletedDoc) {
        await Image.deleteMany({
            _id: {
                $in: deletedDoc.images
            }
        })
    }
    console.log('DELETED USER & POSTS!', deletedDoc)
})

module.exports = mongoose.model('User', UserSchema);
