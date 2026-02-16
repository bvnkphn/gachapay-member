const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profile: {
        username: String,
        display_name: String,
        avatar_url: String
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    resetPasswordOTP: String,
    resetPasswordExpires: Date,
    resetPasswordToken: String,
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationOTP: String,
    emailVerificationExpires: Date
}, { timestamps: true });


// Hash password ก่อน save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Method สำหรับสร้าง reset token
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

// Method สำหรับตรวจสอบ reset token
userSchema.methods.validatePasswordResetToken = function (token) {
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    return this.resetPasswordToken === hashedToken &&
        this.resetPasswordExpires > Date.now();
};


module.exports = mongoose.model('User', userSchema);
