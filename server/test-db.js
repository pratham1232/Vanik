const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

dns.setServers(['8.8.8.8', '8.8.4.4']);

const testConnection = async () => {
    try {
        console.log('Attempting to connect to:', process.env.MONGODB_URI.split('@')[1]); // Log host only for safety
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('SUCCESS: Connected to MongoDB Atlas!');
        process.exit(0);
    } catch (error) {
        console.error('FAILURE: Could not connect to MongoDB Atlas.');
        console.error('Error details:', error.message);
        process.exit(1);
    }
};

testConnection();
