const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    comment: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Comment', CommentSchema);
