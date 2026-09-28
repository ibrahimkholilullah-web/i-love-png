import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    await dbConnect();
    const { name, phoneNumber, profileImage, action } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ success: false, error: "Mobile number is required" }, { status: 400 });
    }

    // Handle Login with only phone number
    if (action === 'login') {
      const user = await User.findOne({ phoneNumber });
      if (!user) {
        return NextResponse.json({ success: false, error: "Account not found. Please register first." }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: user });
    }

    // Handle Profile Update (Name & Image)
    if (action === 'update') {
      let user = await User.findOneAndUpdate(
        { phoneNumber },
        { ...(name && { name }), ...(profileImage !== undefined && { profileImage }) },
        { new: true }
      );
      return NextResponse.json({ success: true, data: user });
    }

    // Handle Registration / Signup
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = await User.create({ name: name || 'User', phoneNumber, profileImage: profileImage || '' });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}