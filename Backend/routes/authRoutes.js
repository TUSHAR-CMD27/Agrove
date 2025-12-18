const express = require('express')
const router = express.Router()
const { signup, login, googleLogin, updateProfile, getProfile } = require('../controllers/authController')

router.post('/signup', signup)
router.post('/login', login);
router.post('/google', googleLogin);

router.put('/update-profile/:id', updateProfile);

router.get('/profile/:id', getProfile);

module.exports = router;