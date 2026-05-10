const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');

const seedData = async () => {
    await connectDB();

    console.log('🌱 Seeding database...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create demo users
    const buyer = await User.create({
        name: 'Vanik Buyer',
        email: 'buyer@vanik.in',
        password: 'demo123',
        role: 'buyer',
        avatar: 'https://ui-avatars.com/api/?name=Vanik+Buyer&background=8B5CF6&color=fff&size=200',
        bio: 'Love discovering handcrafted products ✨'
    });

    const seller = await User.create({
        name: 'Vanik Seller',
        email: 'seller@vanik.in',
        password: 'demo123',
        role: 'seller',
        avatar: 'https://ui-avatars.com/api/?name=Vanik+Seller&background=10B981&color=fff&size=200',
        bio: 'Curating the finest handcrafted goods 🛍️'
    });

    const admin = await User.create({
        name: 'Admin',
        email: 'admin@vanik.in',
        password: 'admin123',
        role: 'admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=FF3B5C&color=fff&size=200',
    });

    console.log('✅ Users created');

    // Create products
    const products = await Product.insertMany([
        {
            title: 'Handcrafted Leather Tote Bag',
            subtitle: 'Premium artisan leather',
            description: 'Beautiful handcrafted leather tote bag made from premium full-grain leather. Perfect for everyday use with multiple compartments and a stylish vintage look.',
            price: 1899,
            originalPrice: 2999,
            discount: 37,
            wholesalePrice: 1200,
            commission: 350,
            category: 'Fashion',
            tags: ['leather', 'bag', 'handcrafted', 'tote'],
            hashtags: ['#HandmadeBags', '#LeatherCraft'],
            images: [
                'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
                'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400'
            ],
            seller: seller._id,
            rating: 4.8,
            reviewCount: 124,
            stock: 45,
            resellable: true
        },
        {
            title: 'Organic Rose Face Serum',
            subtitle: 'Luxury skincare essentials',
            description: 'A nourishing organic rose face serum that hydrates and rejuvenates your skin. Made with 100% natural rose extract and vitamin E.',
            price: 599,
            originalPrice: 999,
            discount: 40,
            wholesalePrice: 350,
            commission: 120,
            category: 'Beauty',
            tags: ['skincare', 'organic', 'serum', 'rose'],
            hashtags: ['#OrganicSkincare', '#GlowUp'],
            images: [
                'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
                'https://images.unsplash.com/photo-1570194065650-d99fb4d8a609?w=400'
            ],
            seller: seller._id,
            rating: 4.6,
            reviewCount: 89,
            stock: 100,
            resellable: true
        },
        {
            title: 'Terracotta Vase Set',
            subtitle: 'Artisan home décor',
            description: 'Set of 3 handmade terracotta vases with unique geometric patterns. Perfect for adding an earthy, artistic touch to your home.',
            price: 1299,
            originalPrice: 1799,
            discount: 28,
            wholesalePrice: 800,
            commission: 250,
            category: 'Home Decor',
            tags: ['vase', 'terracotta', 'home', 'decor', 'handmade'],
            hashtags: ['#HomeDecor', '#Handmade'],
            images: [
                'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400',
                'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=400'
            ],
            seller: seller._id,
            rating: 4.5,
            reviewCount: 67,
            stock: 30,
            resellable: true
        },
        {
            title: 'Embroidered Silk Dupatta',
            subtitle: 'Traditional handwork',
            description: 'Exquisite hand-embroidered silk dupatta featuring intricate phulkari work. A perfect blend of tradition and contemporary style.',
            price: 899,
            originalPrice: 1499,
            discount: 40,
            wholesalePrice: 550,
            commission: 180,
            category: 'Fashion',
            tags: ['dupatta', 'silk', 'embroidered', 'ethnic'],
            hashtags: ['#EthnicFashion', '#Phulkari'],
            images: [
                'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
                'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400'
            ],
            seller: seller._id,
            rating: 4.9,
            reviewCount: 156,
            stock: 60,
            resellable: true
        },
        {
            title: 'Brass Diya Lamp Set',
            subtitle: 'Festival essentials',
            description: 'Handcrafted brass diya lamp set of 5. Each piece is uniquely designed with traditional motifs, perfect for Diwali and festive occasions.',
            price: 749,
            originalPrice: 1199,
            discount: 38,
            wholesalePrice: 450,
            commission: 150,
            category: 'Home Decor',
            tags: ['diya', 'brass', 'festival', 'diwali', 'lamp'],
            hashtags: ['#FestiveDecor', '#Diwali'],
            images: [
                'https://images.unsplash.com/photo-1604080754012-ca4a832241c2?w=400',
                'https://images.unsplash.com/photo-1609874271313-eb4e79fbc498?w=400'
            ],
            seller: seller._id,
            rating: 4.7,
            reviewCount: 203,
            stock: 80,
            resellable: true
        },
        {
            title: 'Natural Ayurvedic Hair Oil',
            subtitle: '100% herbal formula',
            description: 'A blend of 12 Ayurvedic herbs including bhringraj, amla, and coconut oil. Promotes hair growth and prevents hair fall naturally.',
            price: 349,
            originalPrice: 599,
            discount: 42,
            wholesalePrice: 200,
            commission: 80,
            category: 'Beauty',
            tags: ['hair oil', 'ayurvedic', 'herbal', 'natural'],
            hashtags: ['#Ayurveda', '#HairCare'],
            images: [
                'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400',
                'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400'
            ],
            seller: seller._id,
            rating: 4.4,
            reviewCount: 312,
            stock: 200,
            resellable: true
        },
        {
            title: 'Handloom Cotton Saree',
            subtitle: 'Weaver heritage collection',
            description: 'Traditional handloom cotton saree from the weavers of Pochampally. Features authentic ikat design with vibrant colors.',
            price: 2499,
            originalPrice: 3999,
            discount: 38,
            wholesalePrice: 1500,
            commission: 500,
            category: 'Fashion',
            tags: ['saree', 'handloom', 'cotton', 'ikat', 'traditional'],
            hashtags: ['#HandloomSaree', '#MadeInIndia'],
            images: [
                'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
                'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400'
            ],
            seller: seller._id,
            rating: 4.9,
            reviewCount: 87,
            stock: 25,
            resellable: true
        },
        {
            title: 'Ceramic Coffee Mug Set',
            subtitle: 'Studio pottery',
            description: 'Set of 4 hand-thrown ceramic coffee mugs. Each mug is unique with a glazed finish in earth tones. Microwave and dishwasher safe.',
            price: 799,
            originalPrice: 1299,
            discount: 39,
            wholesalePrice: 500,
            commission: 150,
            category: 'Home Decor',
            tags: ['mug', 'ceramic', 'coffee', 'pottery'],
            hashtags: ['#Pottery', '#CoffeeLover'],
            images: [
                'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400',
                'https://images.unsplash.com/photo-1497515114889-2f4e85b3689d?w=400'
            ],
            seller: seller._id,
            rating: 4.6,
            reviewCount: 145,
            stock: 50,
            resellable: true
        }
    ]);

    console.log(`✅ ${products.length} products created`);
    console.log('');
    console.log('📋 Demo Accounts:');
    console.log('   Buyer:  buyer@vanik.in  / demo123');
    console.log('   Seller: seller@vanik.in / demo123');
    console.log('   Admin:  admin@vanik.in  / admin123');
    console.log('');
    console.log('🎉 Database seeded successfully!');
    
    process.exit(0);
};

seedData().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
