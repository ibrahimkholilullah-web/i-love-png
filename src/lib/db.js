import mongoose from 'mongoose';

// সরাসরি আপনার মঙ্গোডিবি কানেকশন লিংক এখানে বসিয়ে দেওয়া হলো যাতে কোনো এরর না আসে
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://chant:Jihze6RuT7Aifnb@cluster0.dife58d.mongodb.net/?retryWrites=true&w=majority";

if (!MONGODB_URI) {
  throw new Error('অনুগ্রহ করে MONGODB_URI ডিফাইন করুন');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;