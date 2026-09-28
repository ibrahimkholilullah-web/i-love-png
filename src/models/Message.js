import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  senderPhone: { type: String, required: true },
  receiverPhone: { type: String, required: true },
  message: { type: String, default: '' },
  mediaUrl: { type: String, default: '' }, // For Image / Video URL or Base64
  mediaType: { type: String, default: '' }, // 'image' or 'video'
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);