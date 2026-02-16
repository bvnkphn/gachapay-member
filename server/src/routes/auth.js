const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { google } = require('googleapis');
const User = require('../models/User');
const auth = require('../middleware/auth');
const EmailService = require('../services/emailService');

const router = express.Router();

// Google OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = new User({
            email,
            password,
            profile: {
                username: username || email.split('@')[0],
                display_name: username || email.split('@')[0]
            }
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                profile: user.profile
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                profile: user.profile
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    res.json({
        user: {
            id: req.user._id,
            email: req.user.email,
            profile: req.user.profile
        }
    });
});

// Forgot Password - ส่งอีเมลรีเซ็ต
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'ไม่พบอีเมลนี้ในระบบ' });
        }

        // Generate OTP
        const otp = EmailService.generateOTP();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to user
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = expires;
        await user.save();

        // Send email
        const emailResult = await EmailService.sendPasswordResetOTP(email, otp);

        if (emailResult.success) {
            res.json({
                success: true,
                message: 'ส่งรหัส OTP ไปยังอีเมลแล้ว'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'ไม่สามารถส่งอีเมลได้'
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Verify OTP (ต่อ)
router.post('/verify-reset-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว'
            });
        }

        // Generate reset token
        const resetToken = require('crypto').randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordOTP = undefined; // Clear OTP
        await user.save();

        res.json({
            success: true,
            resetToken,
            message: 'ยืนยัน OTP สำเร็จ'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        const user = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token ไม่ถูกต้องหรือหมดอายุแล้ว'
            });
        }

        // Update password
        user.password = newPassword; // จะถูก hash ใน pre-save middleware
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'เปลี่ยนรหัสผ่านสำเร็จ'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// Verify Reset Token - ตรวจสอบว่า token ยังใช้ได้หรือไม่
router.get('/verify-reset-token/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token ไม่ถูกต้องหรือหมดอายุแล้ว'
            });
        }

        res.json({
            success: true,
            message: 'Token ถูกต้อง',
            email: user.email
        });
    } catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์'
        });
    }
});

// Google OAuth - Initiate
router.get('/google', (req, res) => {
    try {
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'
            ],
            prompt: 'consent'
        });

        res.json({
            success: true,
            authUrl
        });
    } catch (error) {
        console.error('Google OAuth initiate error:', error);
        res.status(500).json({
            success: false,
            message: 'ไม่สามารถเริ่มต้น Google OAuth ได้'
        });
    }
});

// Google OAuth - Callback
router.get('/google/callback', async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            // Redirect to frontend with error
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
        }

        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get user info from Google
        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        });

        const { data } = await oauth2.userinfo.get();

        // Check if user exists
        let user = await User.findOne({ email: data.email });

        if (!user) {
            // Create new user
            user = new User({
                email: data.email,
                profile: {
                    username: data.name || data.email.split('@')[0],
                    display_name: data.name || data.email.split('@')[0],
                    avatar_url: data.picture
                },
                googleId: data.id,
                // No password for Google OAuth users
                password: crypto.randomBytes(32).toString('hex')
            });

            await user.save();
        } else if (!user.googleId) {
            // Link Google account to existing user
            user.googleId = data.id;
            if (data.picture && !user.profile.avatar_url) {
                user.profile.avatar_url = data.picture;
            }
            await user.save();
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?token=${token}`);
    } catch (error) {
        console.error('Google OAuth callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
});

module.exports = router;
