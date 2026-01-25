const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');

// Helper function to decode JWT without verification (for debugging)
const decodeJWTWithoutVerification = (token) => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return { error: 'Invalid JWT structure: must have 3 parts separated by dots' };
        }
        
        const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        
        return {
            header,
            payload,
            signature: parts[2].substring(0, 20) + '...' + parts[2].substring(parts[2].length - 20),
            isValidStructure: true
        };
    } catch (error) {
        return {
            error: error.message,
            isValidStructure: false
        };
    }
};

// Helper function for structured logging
const logGoogleSignIn = (level, message, data = {}) => {
    const timestamp = new Date().toISOString();
    const logData = {
        timestamp,
        level,
        service: 'GoogleSignIn',
        message,
        ...data
    };
    
    if (level === 'ERROR') {
        console.error(`[${timestamp}] [${level}] ${message}`, JSON.stringify(logData, null, 2));
    } else if (level === 'WARN') {
        console.warn(`[${timestamp}] [${level}] ${message}`, JSON.stringify(logData, null, 2));
    } else {
        console.log(`[${timestamp}] [${level}] ${message}`, JSON.stringify(logData, null, 2));
    }
};

// Validate environment configuration
const validateGoogleConfig = () => {
    const issues = [];
    const warnings = [];
    
    if (!process.env.GOOGLE_WEB_CLIENT_ID) {
        warnings.push('GOOGLE_WEB_CLIENT_ID not set in environment');
    } else if (!process.env.GOOGLE_WEB_CLIENT_ID.includes('.apps.googleusercontent.com')) {
        issues.push('GOOGLE_WEB_CLIENT_ID format appears invalid (should contain .apps.googleusercontent.com)');
    }
    
    if (!process.env.GOOGLE_ANDROID_CLIENT_ID) {
        warnings.push('GOOGLE_ANDROID_CLIENT_ID not set in environment');
    }
    
    if (!process.env.JWT_SECRET) {
        issues.push('JWT_SECRET not set in environment - JWT generation will fail');
    }
    
    if (!process.env.MONGODB_URI) {
        issues.push('MONGODB_URI not set in environment - database operations will fail');
    }
    
    return { issues, warnings };
};

// Get Google Client IDs from environment
const WEB_CLIENT_ID = process.env.GOOGLE_WEB_CLIENT_ID || '';
const ANDROID_CLIENT_ID = process.env.GOOGLE_ANDROID_CLIENT_ID || '';

// Validate and log configuration on startup
const configValidation = validateGoogleConfig();
logGoogleSignIn('INFO', 'Google Sign-In Configuration', {
    hasWebClientId: !!process.env.GOOGLE_WEB_CLIENT_ID,
    hasAndroidClientId: !!process.env.GOOGLE_ANDROID_CLIENT_ID,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasMongoUri: !!process.env.MONGODB_URI,
    configIssues: configValidation.issues,
    configWarnings: configValidation.warnings
});

if (configValidation.issues.length > 0) {
    logGoogleSignIn('ERROR', 'Configuration Issues Detected', {
        issues: configValidation.issues
    });
}

if (configValidation.warnings.length > 0) {
    logGoogleSignIn('WARN', 'Configuration Warnings', {
        warnings: configValidation.warnings
    });
}

const client = new OAuth2Client();

// ==================== REGISTER ====================
// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, confirmPassword } = req.body;
        
        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
            return res.status(400).json({ error: 'All fields are required.' });
        }
        
        // Validate passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match.' });
        }
        
        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        }
        
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered.' });
        }
        
        // Create new user
        const user = new User({ 
            firstName, 
            lastName, 
            email, 
            phone, 
            password 
        });
        await user.save();
        
        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.status(201).json({
            success: true,
            token,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                isAdmin: user.isAdmin,
                picture: user.picture
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(400).json({ error: error.message || 'Registration failed' });
    }
});

// ==================== LOGIN ====================
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }
        
        // Check if user has a password (not Google-only account)
        if (!user.password) {
            return res.status(400).json({ error: 'This account uses Google Sign-In. Please login with Google.' });
        }
        
        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }
        
        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                isAdmin: user.isAdmin,
                picture: user.picture
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ error: error.message || 'Login failed' });
    }
});

// ==================== GOOGLE SIGN-IN ====================
// POST /api/auth/google
router.post('/google', async (req, res) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const startTime = Date.now();
    const stepTimings = {};
    
    try {
        // Enhanced request logging
        const requestStartTime = Date.now();
        logGoogleSignIn('INFO', 'Google Sign-In Request Received', {
            requestId,
            method: req.method,
            url: req.url,
            hasBody: !!req.body,
            bodyKeys: req.body ? Object.keys(req.body) : [],
            timestamp: new Date().toISOString()
        });
        stepTimings.requestReceived = Date.now() - requestStartTime;

        // Step 1: Validate request body
        const validationStartTime = Date.now();
        const { idToken } = req.body;
        
        if (!idToken) {
            logGoogleSignIn('WARN', 'Google Sign-In Failed: No ID Token', {
                requestId,
                bodyKeys: req.body ? Object.keys(req.body) : []
            });
            return res.status(400).json({ 
                error: 'No ID token provided',
                requestId,
                timestamp: new Date().toISOString()
            });
        }
        stepTimings.validation = Date.now() - validationStartTime;

        // Step 1.5: Analyze token structure before verification
        const tokenAnalysisStartTime = Date.now();
        logGoogleSignIn('INFO', 'ID Token Received - Analyzing Structure', {
            requestId,
            tokenLength: idToken.length,
            partsCount: idToken.split('.').length
        });

        // Clean token if it has "Bearer " prefix
        let cleanToken = idToken;
        if (idToken.startsWith('Bearer ')) {
            cleanToken = idToken.replace(/^Bearer\s+/i, '');
            logGoogleSignIn('WARN', 'Token Had Bearer Prefix - Removed', {
                requestId
            });
        }

        // Decode token without verification to inspect structure
        const decodedToken = decodeJWTWithoutVerification(cleanToken);
        logGoogleSignIn('INFO', 'ID Token Structure Analysis', {
            requestId,
            isValidStructure: decodedToken.isValidStructure,
            hasError: !!decodedToken.error,
            email: decodedToken.payload?.email
        });

        stepTimings.tokenAnalysis = Date.now() - tokenAnalysisStartTime;

        // Step 2: Verify token configuration
        const configCheckStartTime = Date.now();
        logGoogleSignIn('INFO', 'Verifying Token Configuration', {
            requestId,
            hasWebClientId: !!WEB_CLIENT_ID,
            hasAndroidClientId: !!ANDROID_CLIENT_ID
        });
        stepTimings.configCheck = Date.now() - configCheckStartTime;

        // Step 3: Verify Google ID token with enhanced error handling
        let ticket, payload;
        const verificationStartTime = Date.now();
        try {
            logGoogleSignIn('INFO', 'Attempting Google Token Verification', {
                requestId,
                audience: [WEB_CLIENT_ID, ANDROID_CLIENT_ID]
            });

            ticket = await client.verifyIdToken({
                idToken: cleanToken,
                audience: [WEB_CLIENT_ID, ANDROID_CLIENT_ID]
            });

            payload = ticket.getPayload();

            logGoogleSignIn('INFO', 'Google Token Verification Success', {
                requestId,
                email: payload.email,
                emailVerified: payload.email_verified
            });
            stepTimings.verification = Date.now() - verificationStartTime;
        } catch (verifyError) {
            stepTimings.verification = Date.now() - verificationStartTime;
            
            logGoogleSignIn('ERROR', 'Google Token Verification Failed', {
                requestId,
                errorMessage: verifyError.message,
                errorName: verifyError.name
            });

            // Provide more specific error messages
            let errorMessage = 'Failed to verify Google token';
            let statusCode = 400;

            const errorMessageLower = (verifyError.message || '').toLowerCase();
            
            if (errorMessageLower.includes('audience') || errorMessageLower.includes('client_id')) {
                errorMessage = 'Token audience mismatch. Please check Google Client ID configuration.';
                statusCode = 401;
            } else if (errorMessageLower.includes('expired') || errorMessageLower.includes('exp')) {
                errorMessage = 'Google token has expired. Please sign in again.';
                statusCode = 401;
            } else if (errorMessageLower.includes('invalid') || errorMessageLower.includes('malformed')) {
                errorMessage = 'Invalid Google token format.';
                statusCode = 401;
            } else if (errorMessageLower.includes('network') || errorMessageLower.includes('timeout')) {
                errorMessage = 'Unable to verify token with Google servers.';
                statusCode = 503;
            } else if (errorMessageLower.includes('signature')) {
                errorMessage = 'Token signature verification failed.';
                statusCode = 401;
            }

            return res.status(statusCode).json({ 
                error: errorMessage,
                details: verifyError.message,
                requestId,
                timestamp: new Date().toISOString()
            });
        }

        // Step 4: Find or create user
        const dbOperationStartTime = Date.now();
        logGoogleSignIn('INFO', 'Looking Up User in Database', {
            requestId,
            email: payload.email,
            googleId: payload.sub
        });

        let user;
        let userAction = 'existing';
        
        try {
            user = await User.findOne({ email: payload.email });
            
            if (!user) {
                logGoogleSignIn('INFO', 'User Not Found - Creating New User', {
                    requestId,
                    email: payload.email
                });

                user = new User({
                    firstName: payload.given_name || '',
                    lastName: payload.family_name || '',
                    email: payload.email,
                    googleId: payload.sub,
                    picture: payload.picture || '',
                    phone: '9999999999'
                });
                
                await user.save();
                userAction = 'created';
                
                logGoogleSignIn('INFO', 'New User Created Successfully', {
                    requestId,
                    userId: user._id.toString(),
                    email: user.email
                });
            } else {
                logGoogleSignIn('INFO', 'Existing User Found', {
                    requestId,
                    userId: user._id.toString(),
                    email: user.email
                });

                // Update Google ID if missing
                if (!user.googleId) {
                    logGoogleSignIn('INFO', 'Updating User with Google ID', {
                        requestId,
                        userId: user._id.toString()
                    });
                    user.googleId = payload.sub;
                    if (payload.picture) {
                        user.picture = payload.picture;
                    }
                    await user.save();
                    userAction = 'updated';
                }
            }
        } catch (dbError) {
            logGoogleSignIn('ERROR', 'Database Operation Failed', {
                requestId,
                errorMessage: dbError.message
            });
            throw dbError;
        }

        // Step 5: Generate JWT token
        logGoogleSignIn('INFO', 'Generating JWT Token', {
            requestId,
            userId: user._id.toString()
        });

        let token;
        try {
            token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
            logGoogleSignIn('INFO', 'JWT Token Generated Successfully', {
                requestId,
                userId: user._id.toString()
            });
        } catch (jwtError) {
            logGoogleSignIn('ERROR', 'JWT Token Generation Failed', {
                requestId,
                errorMessage: jwtError.message
            });
            throw jwtError;
        }

        stepTimings.dbOperation = Date.now() - dbOperationStartTime;

        // Step 6: Success response
        const totalDuration = Date.now() - startTime;
        logGoogleSignIn('INFO', 'Google Sign-In Completed Successfully', {
            requestId,
            userId: user._id.toString(),
            email: user.email,
            userAction,
            totalMs: totalDuration
        });

        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                picture: user.picture,
                isAdmin: user.isAdmin
            },
            requestId,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        const duration = Date.now() - startTime;
        logGoogleSignIn('ERROR', 'Google Sign-In Failed - Unexpected Error', {
            requestId,
            errorMessage: error.message,
            errorName: error.name,
            durationMs: duration
        });

        let statusCode = 500;
        let errorMessage = 'Failed to authenticate with Google';
        let errorDetails = error.message;

        if (error.name === 'ValidationError') {
            statusCode = 400;
            errorMessage = 'Invalid user data';
        } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
            statusCode = 500;
            errorMessage = 'Database error occurred';
            if (process.env.NODE_ENV === 'production') {
                errorDetails = 'Internal server error';
            }
        }

        res.status(statusCode).json({ 
            error: errorMessage,
            details: errorDetails,
            requestId,
            timestamp: new Date().toISOString()
        });
    }
});

// ==================== GET CURRENT USER ====================
// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                _id: req.user._id,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                email: req.user.email,
                phone: req.user.phone,
                picture: req.user.picture,
                isAdmin: req.user.isAdmin,
                createdAt: req.user.createdAt
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(400).json({ error: error.message || 'Failed to get user data' });
    }
});

// ==================== REFRESH TOKEN ====================
// POST /api/auth/refresh-token
router.post('/refresh-token', auth, async (req, res) => {
    try {
        // Generate new token
        const newToken = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.json({
            success: true,
            token: newToken,
            user: {
                _id: req.user._id,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                email: req.user.email,
                phone: req.user.phone,
                picture: req.user.picture,
                isAdmin: req.user.isAdmin
            }
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(400).json({ error: error.message || 'Failed to refresh token' });
    }
});

// ==================== GET ALL USERS (ADMIN ONLY) ====================
// GET /api/auth/users
router.get('/users', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }
        
        // Get all non-admin users
        const users = await User.find({ isAdmin: false })
            .select('-password -googleId')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            users,
            count: users.length
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(400).json({ error: error.message || 'Failed to get users' });
    }
});

// ==================== DELETE ACCOUNT ====================
// DELETE /api/auth/delete-account
router.delete('/delete-account', auth, async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Prevent admin accounts from being deleted via this endpoint
        if (req.user.isAdmin) {
            return res.status(403).json({ 
                error: 'Admin accounts cannot be deleted through this endpoint.',
                success: false 
            });
        }
        
        // Log the deletion attempt
        console.log(`User account deletion requested - User ID: ${userId}, Email: ${req.user.email}`);
        
        // Delete the user account
        await User.findByIdAndDelete(userId);
        
        console.log(`User account deleted successfully - User ID: ${userId}, Email: ${req.user.email}`);
        
        res.json({
            success: true,
            message: 'Your account has been permanently deleted.',
            deletedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to delete account. Please try again.',
            success: false 
        });
    }
});

module.exports = router;
