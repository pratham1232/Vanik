const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @desc    Create Order & Razorpay Order
// @route   POST /api/payments/create-order
router.post('/create-order', protect, async (req, res) => {
    const { amount, items, shippingAddress } = req.body;

    try {
        // 1. Create the order in our MongoDB
        const order = await Order.create({
            user: req.user.id,
            items: items.map(item => ({
                product: item.product,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount: amount,
            shippingAddress: shippingAddress || {},
            status: 'pending'
        });

        // 2. Create Razorpay order
        const options = {
            amount: amount * 100, // amount in paisa
            currency: "INR",
            receipt: order._id.toString(),
        };

        const rzpOrder = await razorpay.orders.create(options);

        if (!rzpOrder) {
            return res.status(500).json({ message: "Failed to create Razorpay order" });
        }

        // Update our order with the Razorpay ID
        order.razorpayOrderId = rzpOrder.id;
        await order.save();

        res.json({
            success: true,
            order: rzpOrder,
            dbOrderId: order._id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Verify Payment
// @route   POST /api/payments/verify
router.post('/verify', protect, async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderData // optional extra data to update
    } = req.body;

    try {
        // Verify signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Payment verified - Update our Order in DB
            const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
            
            if (order) {
                order.status = 'confirmed';
                order.paymentStatus = 'paid';
                order.paymentId = razorpay_payment_id;
                await order.save();
                
                return res.status(200).json({ success: true, message: "Payment verified successfully" });
            } else {
                return res.status(404).json({ message: "Order not found" });
            }
        } else {
            return res.status(400).json({ message: "Invalid payment signature" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
