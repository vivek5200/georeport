const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      
    });
    console.log('MongoDB Connected...');

    // Create indexes after connection
    await createIndexes();
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

async function createIndexes() {
  try {
    // Get all models that might need indexes
    const Report = require('../models/Report'); // Adjust path as needed
    
    // Create indexes for each model
    await Report.createIndexes();
    console.log('Database indexes verified/created');
  } catch (err) {
    console.error('Index creation error:', err);
    // Don't exit process - server can run without indexes (just slower)
  }
}

module.exports = connectDB;