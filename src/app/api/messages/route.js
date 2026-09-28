import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import User from '@/models/User';

export async function POST(request) {
  try {
    await dbConnect();
    const { senderPhone, receiverPhone, message, mediaUrl, mediaType } = await request.json();

    const newMessage = await Message.create({
      senderPhone,
      receiverPhone,
      message: message || '',
      mediaUrl: mediaUrl || '',
      mediaType: mediaType || '',
      isRead: false,
    });

    return NextResponse.json({ success: true, data: newMessage });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const sender = searchParams.get('sender');
    const receiver = searchParams.get('receiver');
    const myPhone = searchParams.get('myPhone');

    if (myPhone && !receiver) {
      const messages = await Message.find({
        $or: [{ senderPhone: myPhone }, { receiverPhone: myPhone }]
      }).sort({ createdAt: -1 });

      const chatMap = new Map();
      
      for (const msg of messages) {
        const partnerPhone = msg.senderPhone === myPhone ? msg.receiverPhone : msg.senderPhone;
        
        if (!chatMap.has(partnerPhone)) {
          const partnerUser = await User.findOne({ phoneNumber: partnerPhone });
          const unreadCount = await Message.countDocuments({
            senderPhone: partnerPhone,
            receiverPhone: myPhone,
            isRead: false
          });

          chatMap.set(partnerPhone, {
            phone: partnerPhone,
            name: partnerUser ? partnerUser.name : partnerPhone,
            profileImage: partnerUser ? partnerUser.profileImage : '',
            lastMessage: msg.mediaType ? `[${msg.mediaType}]` : msg.message,
            time: msg.createdAt,
            unreadCount: unreadCount,
          });
        }
      }

      return NextResponse.json({ success: true, chats: Array.from(chatMap.values()) });
    }

    if (sender && receiver) {
      await Message.updateMany(
        { senderPhone: receiver, receiverPhone: sender, isRead: false },
        { $set: { isRead: true } }
      );

      const messages = await Message.find({
        $or: [
          { senderPhone: sender, receiverPhone: receiver },
          { senderPhone: receiver, receiverPhone: sender }
        ]
      }).sort({ createdAt: 1 });

      return NextResponse.json({ success: true, data: messages });
    }

    return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}