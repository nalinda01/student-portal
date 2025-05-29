// authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/students', authController.getProfile);  // Get logged-in user's profile
router.put('/students', authController.updateProfile); // ✅ update
router.delete('/students', authController.deleteProfile); // ✅ delete

module.exports = router;
