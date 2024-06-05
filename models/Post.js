
const mongoose = require('mongoose');
const moment = require('moment');
const postSchema = new mongoose.Schema({
    name: String,
    time: {
        type: String,
        default: () => moment().format('DD/MM/YYYY hh:mm A'),
    },
    description: String
});

module.exports = mongoose.model('Post', postSchema);
