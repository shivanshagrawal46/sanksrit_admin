const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const requireAuth = require('../middleware/requireAuth');

// Helper functions for status colors
function getStatusColor(status) {
  const colors = {
    'pending': 'warning',
    'confirmed': 'info',
    'processing': 'primary',
    'shipped': 'info',
    'delivered': 'success',
    'cancelled': 'danger'
  };
  return colors[status] || 'secondary';
}

function getPaymentStatusColor(paymentStatus) {
  const colors = {
    'pending': 'warning',
    'paid': 'success',
    'failed': 'danger',
    'refunded': 'info'
  };
  return colors[paymentStatus] || 'secondary';
}

// Apply authentication middleware to all routes
router.use(requireAuth);

// List all orders
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;
    
    const query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by category
    if (category) {
      query.category = category.toLowerCase();
    }
    
    // Search by customer name, email, or product name
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Order.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get statistics
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] } }
        }
      }
    ]);

    const statusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const categoryCounts = await Order.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.render('order/index', {
      orders,
      currentPage: parseInt(page),
      totalPages,
      total,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      status,
      category,
      search,
      stats: stats[0] || { totalOrders: 0, totalRevenue: 0 },
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      categoryCounts: categoryCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      getStatusColor,
      getPaymentStatusColor,
      activePage: 'order',
      activeCategory: null,
      koshCategories: res.locals.koshCategories || [],
      koshSubCategoriesMap: res.locals.koshSubCategoriesMap || {}
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    req.flash('error', 'Error fetching orders');
    res.redirect('/dashboard');
  }
});

// View order details
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      req.flash('error', 'Order not found');
      return res.redirect('/order');
    }

    res.render('order/view', { 
      order,
      getStatusColor,
      getPaymentStatusColor,
      activePage: 'order',
      activeCategory: null,
      koshCategories: res.locals.koshCategories || [],
      koshSubCategoriesMap: res.locals.koshSubCategoriesMap || {}
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    req.flash('error', 'Error fetching order details');
    res.redirect('/order');
  }
});

// Update order status
router.post('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      req.flash('error', 'Status is required');
      return res.redirect(`/order/${req.params.id}`);
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      req.flash('error', 'Invalid status');
      return res.redirect(`/order/${req.params.id}`);
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      req.flash('error', 'Order not found');
      return res.redirect('/order');
    }

    req.flash('success', 'Order status updated successfully');
    res.redirect(`/order/${req.params.id}`);

  } catch (error) {
    console.error('Error updating order status:', error);
    req.flash('error', 'Error updating order status');
    res.redirect(`/order/${req.params.id}`);
  }
});

// Update payment status
router.post('/:id/payment', async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    
    if (!paymentStatus) {
      req.flash('error', 'Payment status is required');
      return res.redirect(`/order/${req.params.id}`);
    }

    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      req.flash('error', 'Invalid payment status');
      return res.redirect(`/order/${req.params.id}`);
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );

    if (!order) {
      req.flash('error', 'Order not found');
      return res.redirect('/order');
    }

    req.flash('success', 'Payment status updated successfully');
    res.redirect(`/order/${req.params.id}`);

  } catch (error) {
    console.error('Error updating payment status:', error);
    req.flash('error', 'Error updating payment status');
    res.redirect(`/order/${req.params.id}`);
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      req.flash('error', 'Order not found');
      return res.redirect('/order');
    }

    req.flash('success', 'Order deleted successfully');
    res.redirect('/order');

  } catch (error) {
    console.error('Error deleting order:', error);
    req.flash('error', 'Error deleting order');
    res.redirect('/order');
  }
});

module.exports = router; 