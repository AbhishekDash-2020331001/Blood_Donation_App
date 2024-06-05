
const express = require('express');
const BloodDonor = require('../models/BloodDonor');
const Registration = require('../models/registration');
const router = express.Router();

// Add blood donor API
router.post('/add', async (req, res) => {
    const { name, blood_group, location,contact_no, disease } = req.body;

    try {
        // Find user by ID
        const user = await Registration.findById(name);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Use the user's name
        const bloodDonor = new BloodDonor({
            name: user.name,
            blood_group,
            location,
            contact_no,
            disease: disease,
            status: 'Available',
            rating: 0 // Initialize rating to 0
        });

        await bloodDonor.save();
        res.status(201).json({ message: 'Blood donor added successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Get all blood donors API or search by query
router.get('/all', async (req, res) => {
    const query = req.query.query;

    try {
        let bloodDonors;

        if (query) {
            const regex = new RegExp(query, 'i'); // 'i' makes it case-insensitive
            bloodDonors = await Registration.find({
                $and: [
                    { $or: [
                        { name: regex },
                        { contact_no: regex },
                        { location: regex },
                        { blood_group: regex }
                    ] },
                    { donation_type: { $in: ['Paid', 'Free'] } }
                ]
            }).select('name blood_group contact_no location donation_type _id');
        } else {
            bloodDonors = await Registration.find({ donation_type: { $in: ['Paid', 'Free'] } })
                                           .select('name blood_group contact_no location donation_type _id');
        }

        res.status(200).json(bloodDonors);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.' });
    }
});


// Mark donor as unavailable API
router.post('/unavailable', async (req, res) => {
    const { id } = req.body;

    try {
        await BloodDonor.findByIdAndUpdate(id, { status: 'Not available' });
        res.status(200).json({ message: 'Blood donor marked as unavailable.' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Mark donor as available API
router.post('/available', async (req, res) => {
    const { id } = req.body;

    try {
        await BloodDonor.findByIdAndUpdate(id, { status: 'Available' });
        res.status(200).json({ message: 'Blood donor marked as available.' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Get user information by ID
router.get('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const user = await Registration.findById(id).select('-password');
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Update user profile API
router.put('/updateProfile', async (req, res) => {
    const { userId, name, age, location, blood_group, contact_no, profession, email, donation_type, disease, password } = req.body;

    try {
        const updateFields = {};
        if (name) updateFields.name = name;
        if (age) updateFields.age = age;
        if (location) updateFields.location = location;
        if (blood_group) updateFields.blood_group = blood_group;
        if (contact_no) updateFields.contact_no = contact_no;
        if (profession) updateFields.profession = profession;
        if (email) updateFields.email = email;
        if (donation_type) updateFields.donation_type = donation_type;
        if (disease) updateFields.disease = disease;
        if (password) updateFields.password = password;

        const updatedUser = await Registration.findByIdAndUpdate(userId, updateFields, { new: true });
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.' });
    }
});


module.exports = router;
