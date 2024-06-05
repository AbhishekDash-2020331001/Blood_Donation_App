
const express = require('express');
const BloodNeeder = require('../models/BloodNeeder');
const Registration = require('../models/registration');
const router = express.Router();

// Add need blood API
router.post('/add', async (req, res) => {
    const { needer_id, blood_group, blood_needing_time, location, amount_of_bag_needed, contact_no } = req.body;

    try {
        // Find user by ID
        const user = await Registration.findById(needer_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Use the user's name
        const bloodNeeder = new BloodNeeder({
            needer_id,
            name: user.name,
            blood_group,
            blood_needing_time,
            location,
            amount_of_bag_needed,
            contact_no,
            status: 'Pending',
            rating: 0 // Initialize rating to 0
        });

        await bloodNeeder.save();
        res.status(201).json({ message: 'Blood need added successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Get all need blood API or search by query
router.get('/all', async (req, res) => {
    const query = req.query.query;

    try {
        let bloodNeeders;

        if (query) {
            const regex = new RegExp(query, 'i'); // 'i' makes it case-insensitive
            bloodNeeders = await BloodNeeder.find({
                $or: [
                    { name: regex },
                    { contact_no: regex },
                    { blood_group: regex },
                    { location: regex }
                ]
            }).sort({ status: 1, post_time: -1 });
        } else {
            bloodNeeders = await BloodNeeder.find().sort({ status: 1, post_time: -1 });
        }

        res.status(200).json(bloodNeeders);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.' });
    }
});


// Complete needing blood API
router.post('/complete', async (req, res) => {
    const { id } = req.body;

    try {
        await BloodNeeder.findByIdAndUpdate(id, { status: 'Completed' });
        res.status(200).json({ message: 'Blood need marked as completed.' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
