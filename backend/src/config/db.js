import mongoose from 'mongoose';

const connectDB = async () => {
  try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        // these options help with faster failure when Mongo is unreachable
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // fail fast if server selection takes too long
        serverSelectionTimeoutMS: 10000
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
