const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    subtitle: String,
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    originalPrice: Number,
    discount: {
        type: Number,
        default: 0
    },
    wholesalePrice: Number,
    commission: Number,
    category: {
        type: String,
        required: [true, 'Please add a category']
    },
    tags: [String],
    hashtags: [String],
    images: {
        type: [String],
        required: [true, 'Please add at least one image']
    },
    seller: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        default: 0
    },
    resellable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
