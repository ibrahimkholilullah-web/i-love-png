import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, unique: true, required: true },
  profileImage: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);