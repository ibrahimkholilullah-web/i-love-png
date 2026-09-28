'use client';
import { useState, useEffect, useRef } from 'react';

export default function ChatPage() {
  const [authMode, setAuthMode] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phoneNumberInput, setPhoneNumberInput] = useState('');
  const [userName, setUserName] = useState('');
  const [myPhone, setMyPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
  
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [chatList, setChatList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [newChatPhone, setNewChatPhone] = useState('');
  const [showNewChatInput, setShowNewChatInput] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  useEffect(() => {
    const savedPhone = localStorage.getItem('chat_user_phone');
    const savedName = localStorage.getItem('chat_user_name');
    const savedImage = localStorage.getItem('chat_user_image');
    if (savedPhone) {
      setMyPhone(savedPhone);
      setUserName(savedName || 'User');
      setProfileImage(savedImage || '');
      setIsLoggedIn(true);
    }
  }, []);

  const fetchChatList = async () => {
    if (!myPhone) return;
    try {
      const res = await fetch(`/api/messages?myPhone=${myPhone}`);
      const data = await res.json();
      if (data.success) {
        setChatList(data.chats);
      }
    } catch (err) {
      console.error("Failed to load chat list:", err);
    }
  };

  const fetchMessages = async () => {
    if (!myPhone || !receiverPhone) return;
    try {
      const res = await fetch(`/api/messages?sender=${myPhone}&receiver=${receiverPhone}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchChatList();
    if (receiverPhone) {
      fetchMessages();
    }
    const interval = setInterval(() => {
      fetchChatList();
      if (receiverPhone) {
        fetchMessages();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoggedIn, myPhone, receiverPhone]);

  // Fix for auto-scroll: Only scroll down if user was already at the bottom
  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // If user scrolls up more than 100px, disable auto-scroll
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isAtBottom);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNumberInput.trim()) return;

    try {
      const payload = authMode === 'login' 
        ? { phoneNumber: phoneNumberInput, action: 'login' }
        : { name: userName, phoneNumber: phoneNumberInput, action: 'register' };

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('chat_user_phone', data.data.phoneNumber);
        localStorage.setItem('chat_user_name', data.data.name);
        localStorage.setItem('chat_user_image', data.data.profileImage || '');
        
        setMyPhone(data.data.phoneNumber);
        setUserName(data.data.name);
        setProfileImage(data.data.profileImage || '');
        setIsLoggedIn(true);
      } else {
        alert(data.error || "Authentication failed");
      }
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: myPhone, 
          name: userName, 
          profileImage: profileImage, 
          action: 'update' 
        }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('chat_user_name', data.data.name);
        localStorage.setItem('chat_user_image', data.data.profileImage || '');
        setShowEditProfile(false);
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Profile update failed:", err);
    }
  };

  // Handle Direct File Upload (Image / Video converted to Base64)
  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      await sendMediaMessage(base64String, type);
    };
    reader.readAsDataURL(file);
  };

  const sendMediaMessage = async (mediaUrl, mediaType) => {
    if (!receiverPhone) return;

    const messagePayload = {
      senderPhone: myPhone,
      receiverPhone: receiverPhone,
      message: '',
      mediaUrl,
      mediaType,
    };

    try {
      setShouldAutoScroll(true);
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messagePayload),
      });
      const data = await res.json();
      if (data.success) {
        fetchMessages();
        fetchChatList();
      }
    } catch (error) {
      console.error('Failed to send media:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !receiverPhone) return;

    const messagePayload = {
      senderPhone: myPhone,
      receiverPhone: receiverPhone,
      message: inputMessage,
      mediaUrl: '',
      mediaType: '',
    };

    try {
      setInputMessage('');
      setShouldAutoScroll(true);
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messagePayload),
      });
      const data = await res.json();
      if (data.success) {
        fetchMessages();
        fetchChatList();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#030614] text-white font-sans overflow-hidden">
      
      {/* Luxury Compact Container */}
      <div className="flex w-full max-w-4xl h-[88vh] bg-[#080C1E]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative">

        {/* Login Modal */}
        {!isLoggedIn && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="bg-[#0D1330] border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-3 shadow-lg shadow-cyan-500/30">
                  💬
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-wide">
                  {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  {authMode === 'login' ? 'Enter phone number to access chat' : 'Register with name & phone'}
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'register' && (
                  <div>
                    <label className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Your Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Ibrahim Kholilullah" 
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full mt-1.5 px-4 py-3 bg-[#131B3D] border border-white/10 rounded-2xl text-xs focus:outline-none focus:border-cyan-500 text-gray-200 transition shadow-inner"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Mobile Number</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 01862823329" 
                    value={phoneNumberInput}
                    onChange={(e) => setPhoneNumberInput(e.target.value)}
                    className="w-full mt-1.5 px-4 py-3 bg-[#131B3D] border border-white/10 rounded-2xl text-xs focus:outline-none focus:border-cyan-500 text-gray-200 transition shadow-inner"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold rounded-2xl text-xs shadow-lg shadow-blue-600/30 transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  {authMode === 'login' ? 'Login Now' : 'Register & Start'}
                </button>
              </form>

              <div className="text-center mt-5">
                <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition"
                >
                  {authMode === 'login' ? "Don't have an account? Register" : "Already have an account? Login"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
            <div className="bg-[#0D1330] border border-white/10 p-6 rounded-3xl w-full max-w-sm shadow-2xl">
              <h3 className="text-base font-bold mb-4 text-cyan-400">Edit Profile</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400">Name</label>
                  <input 
                    type="text" 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 bg-[#131B3D] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Profile Image URL</label>
                  <input 
                    type="text" 
                    placeholder="Image URL..." 
                    value={profileImage} 
                    onChange={(e) => setProfileImage(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 bg-[#131B3D] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-xs font-bold shadow">Save</button>
                  <button type="button" onClick={() => setShowEditProfile(false)} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs font-medium">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Left Sidebar (Chats) */}
        <div className="w-[38%] bg-[#0A0F29]/80 border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setShowEditProfile(true)}>
              <div className="relative">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500 shadow-md" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-extrabold text-xs text-white shadow-md">
                    {userName ? userName.slice(0, 2).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-200 truncate group-hover:text-cyan-400 transition">{userName}</p>
                <p className="text-[10px] text-gray-400">{myPhone}</p>
              </div>
            </div>

            <button 
              onClick={() => setShowNewChatInput(!showNewChatInput)}
              className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white text-[11px] font-bold rounded-xl transition shadow-lg shadow-cyan-500/20"
            >
              + New Chat
            </button>
          </div>

          {/* New Chat Input Box */}
          {showNewChatInput && (
            <div className="p-3 bg-[#131B3D] border-b border-white/10 flex gap-2">
              <input 
                type="text" 
                placeholder="Receiver phone number..." 
                value={newChatPhone}
                onChange={(e) => setNewChatPhone(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#080C1E] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button 
                onClick={() => {
                  if(newChatPhone.trim()) {
                    setReceiverPhone(newChatPhone.trim());
                    setReceiverName(newChatPhone.trim());
                    setShowNewChatInput(false);
                    setNewChatPhone('');
                  }
                }}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold shadow"
              >
                Go
              </button>
            </div>
          )}

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {chatList.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-xs mt-10">
                No recent chats yet.
              </div>
            ) : (
              chatList.map((chat) => (
                <div 
                  key={chat.phone}
                  onClick={() => {
                    setReceiverPhone(chat.phone);
                    setReceiverName(chat.name);
                    setShouldAutoScroll(true);
                  }}
                  className={`p-3.5 flex items-center justify-between cursor-pointer transition hover:bg-white/5 ${
                    receiverPhone === chat.phone ? 'bg-white/10 border-l-4 border-cyan-400' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    {/* Profile Icon with Red Notification Badge */}
                    <div className="relative flex-shrink-0">
                      {chat.profileImage ? (
                        <img src={chat.profileImage} alt="" className="w-10 h-10 rounded-full object-cover border border-white/20" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xs text-white shadow">
                          {chat.name ? chat.name.slice(0, 2).toUpperCase() : chat.phone.slice(-2)}
                        </div>
                      )}
                      
                      {/* Red notification count badge */}
                      {chat.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg ring-2 ring-[#080C1E] animate-bounce">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-200 truncate">{chat.name}</p>
                      <p className="text-[10px] text-gray-400">{chat.phone}</p>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">{chat.lastMessage}</p>
                    </div>
                  </div>

                  <div className="text-right ml-2 flex-shrink-0">
                    <span className="text-[9px] text-gray-500">
                      {new Date(chat.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Chat Window */}
        <div className="flex-1 flex flex-col bg-[#06091B]/50">
          {receiverPhone ? (
            <>
              {/* Header */}
              <div className="p-3.5 px-6 bg-[#0A0F29]/80 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xs text-white shadow">
                    {receiverName ? receiverName.slice(0, 2).toUpperCase() : receiverPhone.slice(-2)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-200">{receiverName || receiverPhone}</p>
                    <p className="text-[10px] text-cyan-400 flex items-center gap-1 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Messages container with scroll event listener */}
              <div 
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 p-6 overflow-y-auto space-y-3.5"
              >
                {messages.map((msg, index) => {
                  const isMe = msg.senderPhone === myPhone;
                  return (
                    <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-2xl max-w-xs text-xs shadow-xl leading-relaxed ${
                        isMe 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-none' 
                          : 'bg-[#131B3D] border border-white/10 text-gray-200 rounded-bl-none'
                      }`}>
                        {/* Render Image if mediaType is image */}
                        {msg.mediaType === 'image' && (
                          <img src={msg.mediaUrl} alt="Uploaded" className="rounded-xl max-h-48 w-object-cover mb-2 shadow" />
                        )}

                        {/* Render Video if mediaType is video */}
                        {msg.mediaType === 'video' && (
                          <video src={msg.mediaUrl} controls className="rounded-xl max-h-48 mb-2 shadow" />
                        )}

                        {msg.message && <p>{msg.message}</p>}

                        <span className="block text-[8px] text-right mt-1 opacity-70">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer with Image & Video Upload Buttons */}
              <div className="p-3.5 px-6 bg-[#0A0F29]/80 border-t border-white/10 flex gap-2.5 items-center">
                
                {/* Image Upload Input Button */}
                <label className="cursor-pointer p-2.5 bg-[#131B3D] hover:bg-white/10 border border-white/10 rounded-xl text-cyan-400 transition shadow flex items-center justify-center" title="Upload Image">
                  📷
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} className="hidden" />
                </label>

                {/* Video Upload Input Button */}
                <label className="cursor-pointer p-2.5 bg-[#131B3D] hover:bg-white/10 border border-white/10 rounded-xl text-purple-400 transition shadow flex items-center justify-center" title="Upload Video">
                  🎥
                  <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} className="hidden" />
                </label>

                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-4 py-3 bg-[#131B3D] border border-white/10 rounded-2xl text-xs focus:outline-none focus:border-cyan-500 text-gray-200 shadow-inner"
                />
                
                <button 
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white px-6 py-3 rounded-2xl font-bold text-xs transition shadow-lg shadow-cyan-500/20 active:scale-95"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#131B3D] border border-white/10 flex items-center justify-center text-cyan-400 text-xl shadow-inner">
                💬
              </div>
              <p className="text-xs font-medium">Select a chat or start a new conversation</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}