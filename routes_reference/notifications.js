const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const requireAuth = require('../middleware/requireAuth');
const FCMService = require('../services/fcmService');

// Get all notifications (admin view)
router.get('/', requireAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find()
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Notification.countDocuments();
        const totalPages = Math.ceil(total / limit);

        res.render('notifications/index', {
            notifications,
            currentPage: page,
            totalPages,
            total,
            username: req.session.username,
            activePage: 'notifications',
            activeCategory: null,
            activeSubCategory: null,
            koshCategories: [],
            mcqCategories: []
        });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.render('notifications/index', {
            notifications: [],
            currentPage: 1,
            totalPages: 0,
            total: 0,
            username: req.session.username,
            activePage: 'notifications',
            activeCategory: null,
            activeSubCategory: null,
            koshCategories: [],
            mcqCategories: [],
            error: 'Error fetching notifications'
        });
    }
});

// Get notification form (add new)
router.get('/add', requireAuth, (req, res) => {
    res.render('notifications/form', {
        notification: null,
        username: req.session.username,
        activePage: 'notifications',
        activeCategory: null,
        activeSubCategory: null,
        koshCategories: [],
        mcqCategories: [],
        formAction: '/notifications/add',
        formTitle: 'Add New Notification'
    });
});

// Get notification form (edit)
router.get('/edit/:id', requireAuth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.redirect('/notifications?error=Notification not found');
        }

        res.render('notifications/form', {
            notification,
            username: req.session.username,
            activePage: 'notifications',
            activeCategory: null,
            activeSubCategory: null,
            koshCategories: [],
            mcqCategories: [],
            formAction: `/notifications/edit/${req.params.id}`,
            formTitle: 'Edit Notification'
        });
    } catch (err) {
        console.error('Error fetching notification:', err);
        res.redirect('/notifications?error=Error fetching notification');
    }
});

// Create new notification
router.post('/add', requireAuth, async (req, res) => {
    try {
        const {
            title,
            message,
            type,
            priority,
            targetAudience,
            isActive,
            scheduledAt,
            expiresAt,
            actionUrl,
            actionText,
            imageUrl
        } = req.body;

        // Validate required fields
        if (!title || !message) {
            return res.render('notifications/form', {
                notification: null,
                username: req.session.username,
                activePage: 'notifications',
                activeCategory: null,
                activeSubCategory: null,
                koshCategories: [],
                mcqCategories: [],
                formAction: '/notifications/add',
                formTitle: 'Add New Notification',
                error: 'Title and message are required'
            });
        }

        const notification = new Notification({
            title,
            message,
            type: type || 'info',
            priority: priority || 'medium',
            targetAudience: targetAudience || 'all',
            isActive: isActive === 'on' || isActive === true,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            actionUrl: actionUrl || null,
            actionText: actionText || null,
            imageUrl: imageUrl || null,
            createdBy: null // No user management in this backend
        });

        await notification.save();
        
        // 🚀 INSTANT PUSH NOTIFICATION - Send immediately to all users!
        try {
            console.log('🚀 Sending instant push notification...');
            await FCMService.sendToAll(notification);
            console.log('✅ Push notification sent successfully!');
        } catch (pushError) {
            console.error('❌ Push notification failed:', pushError);
            // Continue even if push fails - notification is still saved
        }
        
        res.redirect('/notifications?success=Notification created and sent instantly to all users!');
    } catch (err) {
        console.error('Error creating notification:', err);
        res.render('notifications/form', {
            notification: null,
            username: req.session.username,
            activePage: 'notifications',
            activeCategory: null,
            activeSubCategory: null,
            koshCategories: [],
            mcqCategories: [],
            formAction: '/notifications/add',
            formTitle: 'Add New Notification',
            error: 'Error creating notification'
        });
    }
});

// Update notification
router.post('/edit/:id', requireAuth, async (req, res) => {
    try {
        const {
            title,
            message,
            type,
            priority,
            targetAudience,
            isActive,
            scheduledAt,
            expiresAt,
            actionUrl,
            actionText,
            imageUrl
        } = req.body;

        // Validate required fields
        if (!title || !message) {
            return res.render('notifications/form', {
                notification: { ...req.body, _id: req.params.id },
                username: req.session.username,
                activePage: 'notifications',
                activeCategory: null,
                activeSubCategory: null,
                koshCategories: [],
                mcqCategories: [],
                formAction: `/notifications/edit/${req.params.id}`,
                formTitle: 'Edit Notification',
                error: 'Title and message are required'
            });
        }

        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            {
                title,
                message,
                type: type || 'info',
                priority: priority || 'medium',
                targetAudience: targetAudience || 'all',
                isActive: isActive === 'on' || isActive === true,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                actionUrl: actionUrl || null,
                actionText: actionText || null,
                imageUrl: imageUrl || null
            },
            { new: true }
        );

        if (!notification) {
            return res.redirect('/notifications?error=Notification not found');
        }

        // 🚀 INSTANT PUSH NOTIFICATION - Send updated notification to all users!
        try {
            console.log('🚀 Sending updated push notification...');
            await FCMService.sendToAll(notification);
            console.log('✅ Updated push notification sent successfully!');
        } catch (pushError) {
            console.error('❌ Push notification failed:', pushError);
            // Continue even if push fails - notification is still updated
        }

        res.redirect('/notifications?success=Notification updated and sent instantly to all users!');
    } catch (err) {
        console.error('Error updating notification:', err);
        res.redirect('/notifications?error=Error updating notification');
    }
});

// Delete notification
router.post('/delete/:id', requireAuth, async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) {
            return res.redirect('/notifications?error=Notification not found');
        }
        res.redirect('/notifications?success=Notification deleted successfully');
    } catch (err) {
        console.error('Error deleting notification:', err);
        res.redirect('/notifications?error=Error deleting notification');
    }
});

// Toggle notification status
router.post('/toggle/:id', requireAuth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.redirect('/notifications?error=Notification not found');
        }

        notification.isActive = !notification.isActive;
        await notification.save();
        
        const status = notification.isActive ? 'activated' : 'deactivated';
        res.redirect(`/notifications?success=Notification ${status} successfully`);
    } catch (err) {
        console.error('Error toggling notification:', err);
        res.redirect('/notifications?error=Error toggling notification status');
    }
});

// API endpoint for Flutter app to fetch active notifications
router.get('/api/active', async (req, res) => {
    try {
        const { targetAudience = 'all', limit = 50 } = req.query;
        
        const query = {
            isActive: true,
            scheduledAt: { $lte: new Date() }
        };

        // Add expiration filter
        query.$or = [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
        ];

        // Filter by target audience
        if (targetAudience !== 'all') {
            query.targetAudience = { $in: ['all', targetAudience] };
        }

        const notifications = await Notification.find(query)
            .select('title message type priority targetAudience actionUrl actionText imageUrl scheduledAt createdAt')
            .sort({ priority: -1, createdAt: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: notifications,
            count: notifications.length
        });
    } catch (err) {
        console.error('Error fetching active notifications:', err);
        res.status(500).json({
            success: false,
            error: 'Error fetching notifications'
        });
    }
});

// API endpoint to mark notification as read (for analytics)
router.post('/api/read/:id', async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(
            req.params.id,
            { $inc: { readCount: 1 } }
        );
        
        res.json({ success: true });
    } catch (err) {
        console.error('Error marking notification as read:', err);
        res.status(500).json({
            success: false,
            error: 'Error marking notification as read'
        });
    }
});

// API endpoint for Flutter app to register FCM token
router.post('/api/register-token', async (req, res) => {
    try {
        const { fcmToken, platform = 'android', appVersion = '1.0.0', osVersion = '' } = req.body;
        
        if (!fcmToken) {
            return res.status(400).json({
                success: false,
                error: 'fcmToken is required'
            });
        }

        // Subscribe device to general notifications topic
        try {
            await FCMService.subscribeToTopic([fcmToken], 'all_users');
            console.log('✅ Device subscribed to all_users topic');
        } catch (topicError) {
            console.error('❌ Error subscribing to topic:', topicError);
            return res.status(500).json({
                success: false,
                error: 'Failed to register for notifications'
            });
        }

        res.json({
            success: true,
            message: 'FCM token registered successfully - device will receive all notifications',
            deviceInfo: {
                platform: platform,
                appVersion: appVersion,
                osVersion: osVersion
            }
        });
    } catch (err) {
        console.error('Error registering FCM token:', err);
        res.status(500).json({
            success: false,
            error: 'Error registering FCM token'
        });
    }
});

// API endpoint to send test notification (public for testing)
router.post('/api/send-test', async (req, res) => {
    try {
        const { message } = req.body;
        
        const testNotification = {
            _id: 'test-' + Date.now(),
            title: 'Test Notification',
            message: message || 'This is a test notification from admin panel',
            type: 'info',
            priority: 'medium',
            targetAudience: 'all',
            scheduledAt: new Date(),
            actionUrl: '',
            actionText: '',
            imageUrl: ''
        };

        // Send to all users via topic
        await FCMService.sendToAll(testNotification);
        res.json({ 
            success: true, 
            message: 'Test notification sent to all users successfully' 
        });
    } catch (err) {
        console.error('Error sending test notification:', err);
        res.status(500).json({
            success: false,
            error: 'Error sending test notification'
        });
    }
});

module.exports = router;
