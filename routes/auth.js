const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Registration = require('../models/registration');
const router = express.Router();

// Registration API
router.post('/register', async (req, res) => {
    const { name, age, location, blood_group, contact_no, password, profession, email, donation_type, disease } = req.body;

    try {
        let user = await Registration.findOne({ contact_no });
        if (user) return res.status(400).json({ message: 'User already registered.' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new Registration({
            name,
            age,
            location,
            blood_group,
            contact_no,
            password: hashedPassword,
            profession,
            email,
            donation_type,
            disease
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Login API
router.post('/login', async (req, res) => {
    const { contact_no, password } = req.body;
    //console.log("came");
    const user = await Registration.findOne({ contact_no });
    if (!user) return res.status(400).json({ message: 'Invalid contact number or password.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid contact number or password.' });

    const token = jwt.sign({ _id: user._id }, 'amarkeynai');
    res.status(200).json({ token, userId: user._id });
});


module.exports = router;
