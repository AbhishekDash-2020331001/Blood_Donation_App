
const mongoose = require('mongoose');

const bloodDonorSchema = new mongoose.Schema({
    name: String,
    post_time: { type: Date, default: Date.now },
    blood_group: String,
    location: String,
    contact_no: String,
    status: { type: String, enum: ['Available', 'Not available'], default: 'Available' },
    disease: { type: String, default: 'No disease' },
    rating: { type: Number, default: 0 }
});

module.exports = mongoose.model('BloodDonor', bloodDonorSchema);
