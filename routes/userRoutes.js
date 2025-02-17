// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controllers/userController.js');
const authenticateToken = require('../Middleware/authenticateToken.js');

// Multer setup for file uploads
const upload = multer({ dest: 'public/uploads/' });

// User routes
router.get('/users', authenticateToken, userController.usersPage);

// Add user routes
router.get('/add-user', authenticateToken, userController.addUserPage);
router.post('/add-user', authenticateToken, upload.single('photo'), userController.addUser);

// Edit user routes
router.get('/edit-user/:id', authenticateToken, userController.editUserPage);
router.post('/edit-user/:id', authenticateToken, userController.updateUser);

// Delete user route
router.get('/delete-user/:id', authenticateToken, userController.deleteUser);

// Profile route
router.get('/profile/:id', authenticateToken, userController.userProfile);

module.exports = router;
