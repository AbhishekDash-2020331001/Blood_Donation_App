
const mongoose = require('mongoose');

const bloodNeederSchema = new mongoose.Schema({
    needer_id: String,
    name: String,
    blood_group: String,
    post_time: { type: Date, default: Date.now },
    blood_needing_time: Date,
    location: String,
    amount_of_bag_needed: Number,
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
    contact_no: String,
    rating: { type: Number, default: 0 }
});

module.exports = mongoose.model('BloodNeeder', bloodNeederSchema);
