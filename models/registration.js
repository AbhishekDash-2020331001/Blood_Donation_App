const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    message: String,
    date: { type: Date, default: Date.now }
});

const registrationSchema = new mongoose.Schema({
    name: String,
    age: Number,
    location: String,
    blood_group: String,
    contact_no: { type: String, unique: true },
    password: String,
    profession: String,
    email: String,
    notification: [notificationSchema],
    donation_type: { type: String, enum: ['Not a donor', 'Paid', 'Free'] },
    disease: { type: String, default: 'No disease' },
    isVerified: { type: Boolean, default: false },
    referenceNo: String
});

module.exports = mongoose.model('Registration', registrationSchema);