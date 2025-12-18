const express = require('express')
const router = express.Router()
const { signup, login, googleLogin, updateProfile } = require('../controllers/authController')

router.post('/signup', signup)
router.post('/login', login);
router.post('/google', googleLogin);

router.put('/update-profile/:id', updateProfile);

module.exports = router;