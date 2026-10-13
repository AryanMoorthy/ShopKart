const mongoose = require('mongoose');

const connectDB = async () => {
  console.log('Connecting to MongoDB...');
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopkart';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Local MongoDB connection failed (${error.message}).`);
    console.log('Starting standalone In-Memory MongoDB server...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`MongoDB Connected: In-Memory Database (${conn.connection.host})`);
    } catch (memError) {
      console.error(`Database Connection Error: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
