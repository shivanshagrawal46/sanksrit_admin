const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        trim: true
        // Will be auto-generated from firstName + lastName
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: { 
        type: String, 
        default: '9999999999' // Make phone optional for Google login
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId; // Password is required only if not using Google login
        }
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    picture: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate username from firstName and lastName before saving
userSchema.pre('save', async function(next) {
    // Generate username if not already set
    if (!this.username && this.firstName && this.lastName) {
        // Create username: firstname.lastname (lowercase, no spaces)
        let baseUsername = `${this.firstName}.${this.lastName}`.toLowerCase().replace(/\s+/g, '');
        
        // Check if username already exists
        let username = baseUsername;
        let counter = 1;
        
        // Keep trying with incremental numbers until we find a unique username
        while (await mongoose.model('User').findOne({ username, _id: { $ne: this._id } })) {
            username = `${baseUsername}${counter}`;
            counter++;
        }
        
        this.username = username;
    }
    
    // Hash password if modified
    if (this.isModified('password') && this.password) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 