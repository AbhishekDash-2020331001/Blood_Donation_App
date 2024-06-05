/*
const express = require('express');
const Post = require('../models/Post');
const Registration = require('../models/Registration');
const router = express.Router();

// Add post API
router.post('/add', async (req, res) => {
    const { name: userId, description } = req.body;

    try {
        // Find user by ID
        const user = await Registration.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Use the user's name
        const post = new Post({ name: user.name, description });
        await post.save();

        res.status(201).json({ message: 'Post added successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Get all posts API
router.get('/all', async (req, res) => {
    try {
        const posts = await Post.find().sort({ time: -1 });
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
*/