const mongoose = require('mongoose');

const uplodePhoto = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    photo: {type: String}
});

const userPhoto = mongoose.model('userPhoto', uplodePhoto);
module.exports = userPhoto;