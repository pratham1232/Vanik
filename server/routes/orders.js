const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.product', 'title price');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('items.product', 'title images price');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Get single order
// @route   GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.product', 'title images price');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Only allow user who owns the order or admin
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Create new order
// @route   POST /api/orders
router.post('/', protect, async (req, res) => {
    const { items, shippingAddress, totalAmount } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    try {
        const order = new Order({
            user: req.user.id,
            items,
            shippingAddress,
            totalAmount
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
