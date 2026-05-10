const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all products
// @route   GET /api/products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate('seller', 'name avatar');
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Get single product
// @route   GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('seller', 'name avatar');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Create product
// @route   POST /api/products
router.post('/', protect, authorize('seller', 'admin'), async (req, res) => {
    try {
        const product = new Product({
            ...req.body,
            seller: req.user.id
        });
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
