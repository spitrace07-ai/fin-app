const express = require('express');
const router = express.Router();
const path = require('path');

// Helper to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (req.session.user) return next();
    res.redirect('/login');
};

// Landing Page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

// Login Page
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

// Dashboard
router.get('/dashboard', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/dashboard.html'));
});

// Transactions Page
router.get('/transactions', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/transactions.html'));
});

module.exports = router;
