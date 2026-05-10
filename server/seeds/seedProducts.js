const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const User = require('../models/User');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const products = [
    {
        title: "Handcrafted Leather Bag",
        subtitle: "Brown • Premium Leather",
        price: 1899,
        originalPrice: 2499,
        discount: 24,
        category: "Fashion",
        description: "Premium handcrafted leather bag with spacious compartments. Perfect for work and travel.",
        images: ["https://picsum.photos/400/400?random=1"],
        tags: ["leather", "bag", "fashion"],
        stock: 15
    },
    {
        title: "Minimalist Watch",
        subtitle: "Silver • Stainless Steel",
        price: 1499,
        originalPrice: 1999,
        discount: 25,
        category: "Electronics",
        description: "Clean minimalist watch with sapphire crystal glass.",
        images: ["https://picsum.photos/400/400?random=2"],
        tags: ["watch", "accessories"],
        stock: 8
    },
    {
        title: "Terracotta Vase",
        subtitle: "Handmade • Set of 3",
        price: 1299,
        originalPrice: 1299,
        discount: 0,
        category: "Home Decor",
        description: "Beautifully handcrafted terracotta vases in three different sizes.",
        images: ["https://picsum.photos/400/400?random=3"],
        tags: ["pottery", "home", "decor"],
        stock: 22
    }
];

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Product.deleteMany();
        await User.deleteMany();

        // Create a dummy seller
        const seller = await User.create({
            name: "Style Studio",
            email: "seller@vanik.com",
            role: "seller",
            avatar: "https://i.pravatar.cc/100?img=47"
        });

        const productsWithSeller = products.map(p => ({
            ...p,
            seller: seller._id
        }));

        await Product.insertMany(productsWithSeller);

        console.log('Data Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
