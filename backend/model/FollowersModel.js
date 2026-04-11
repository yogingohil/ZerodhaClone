const mongoose = require('mongoose');

const followersSchema = new mongoose.Schema({
    follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    trader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    multiplier: {
        type: Number,
        default: 1,
        min: 0.1,
        max: 10
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const FollowersModel = mongoose.model('Followers', followersSchema);
module.exports = { FollowersModel };