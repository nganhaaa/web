import { useState, useEffect, useRef } from "react";
import { assets } from "../assets/assets";
import moment from "moment";
import {io} from 'socket.io-client'; 
import { backendUrl } from '../App';
import axios from "axios";
import { toast } from "react-toastify";


const Chat = ({token}) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);  
  const messageEndRef = useRef(null);  
  const messagesContainerRef = useRef(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const scrollToBottom = () => {
    if (messagesContainerRef.current && messageEndRef.current) {
      const container = messagesContainerRef.current;
      const scrollHeight = container.scrollHeight;
  
      container.scrollTo({
        top: scrollHeight,
        behavior: 'smooth',
      });
    }
  };


  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUser]);

  const getUserMessage = async () => {
    try {
      console.log('🔍 Fetching users from:', backendUrl+'/api/chat/get-user');
      console.log('🔑 Using token:', token ? 'Token exists' : 'No token');
      
      const res = await axios.get(backendUrl+'/api/chat/get-user', {headers: {token}})
      
      console.log('✅ Response:', res.data);
      
      if(res.data.success) {
        setUsers(res.data.users.reverse());
        console.log('👥 Users loaded:', res.data.users.length);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to load chat users')
    }
  }

  useEffect(() => {
    getUserMessage()
  },[token])

  useEffect(() => {
    if (users.length > 0 && !selectedUser) {
      setSelectedUser(users[0]);
    }
  }, [users]);

  useEffect(() => {
    if (!token) return;
    
    const newSocket = io(backendUrl, {
      query: { token },
      transports: ['websocket', 'polling']
    });
    
    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
      // Join admin room immediately when connected
      newSocket.emit('join', {
        userId: 'admin',
        adminId: 'admin'
      });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });
    
    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.off('connect');
        newSocket.off('disconnect');
        newSocket.off('connect_error');
        newSocket.disconnect();
      }
    };
  }, [token]);

  useEffect(() => {
    if (!socket || !selectedUser) {
      setMessages([]);
      return;
    }

    // Reset messages when switching users
    setMessages([]);

    // Request messages for selected user (admin stays in 'admin' room)
    socket.emit('join', {
      userId: 'admin',
      adminId: selectedUser.userId  // Tell server which user's messages to fetch
    });

    // Listen for previous messages
    const handlePreviousMessages = (prevMessages) => {
      console.log('📨 Received previous messages:', prevMessages.length);
      setMessages(prevMessages);
    };

    // Listen for new messages
    const handlePrivateMessage = (newMsg) => {
      console.log('💬 New message received:', newMsg);
      // Show ALL messages related to selectedUser: user messages, bot messages, admin messages
      const isUserMessage = newMsg.sender === selectedUser.userId && newMsg.receiver === 'admin';
      const isAdminMessage = newMsg.sender === 'admin' && newMsg.receiver === selectedUser.userId;
      const isBotMessage = newMsg.sender === 'bot' && newMsg.receiver === selectedUser.userId;
      
      if (isUserMessage || isAdminMessage || isBotMessage) {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(m => 
            m.message === newMsg.message && 
            m.sender === newMsg.sender && 
            m.receiver === newMsg.receiver &&
            Math.abs(new Date(m.timestamp) - new Date(newMsg.timestamp)) < 2000
          );
          if (exists) {
            console.log('⚠️ Duplicate message detected, skipping:', newMsg);
            return prev;
          }
          return [...prev, newMsg];
        });
      }
    };

    socket.on('previousMessages', handlePreviousMessages);
    socket.on('privateMessage', handlePrivateMessage);

    return () => {
      socket.off('previousMessages', handlePreviousMessages);
      socket.off('privateMessage', handlePrivateMessage);
    };
  }, [socket, selectedUser]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  const sendMessage = () => {
    if (newMessage.trim() && socket) {
      const messageData = {  
        sender: 'admin',  
        receiver: selectedUser.userId ,  
        message: newMessage,  
        timestamp: new Date()  
      };  

      socket.emit('privateMessage', messageData);   
      setNewMessage('');
    }
  };

  const handleKeyDown = (event) => {  
    if (event.key === 'Enter') {  
      event.preventDefault();  
      sendMessage();  
    }  
  };  

  return (
    <div className="flex w-full relative">
      {/* Tuyết rơi background cho admin chat */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-red-200 opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-20px',
              fontSize: `${8 + Math.random() * 12}px`,
              animation: `fall ${6 + Math.random() * 6}s linear infinite`,
              animationDelay: `${Math.random() * 6}s`
            }}
          >
            ❄
          </div>
        ))}
      </div>

      {/* User List - Hidden on mobile when chat is shown */}
      <div className={`w-full sm:w-[30%] sm:border-r-2 border-red-200 relative z-10 ${showMobileChat ? 'hidden sm:block' : 'block'}`}>
        <h2 className="font-medium text-lg md:text-3xl bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent my-5 flex items-center gap-2">
          Admin Chat - Christmas
        </h2>
        <div className="flex flex-col h-[500px] overflow-y-scroll hidden_scroll">
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="text-5xl mb-3">💬</div>
              <p className="text-gray-500 text-sm">No chat messages yet</p>
              <p className="text-gray-400 text-xs mt-2">Users will appear here when they send messages</p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.userId}
                onClick={() => handleSelectUser(user)}
                className={`cursor-pointer px-3 rounded-lg transition-all ${
                  selectedUser?.userId === user.userId 
                    ? "bg-gradient-to-r from-red-100 to-green-100 shadow-md" 
                    : "hover:bg-red-50"
                }`}
              >
                <div className="flex gap-3 w-full py-3 mb-2 items-center">
                  <div className="relative">
                    <img
                      src={assets.avatar_woman}
                      alt="avatar"
                      className="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-red-300"
                    />
                  </div>
                  <div className="flex items-center">
                    <p className="font-medium text-gray-800 sm:text-base lg:text-lg">{user.username}</p>
                  </div>
                </div>
                <hr className="w-[90%] m-auto border-red-200" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Interface - Show on mobile only when a user is selected */}
      <div className={`w-full sm:w-[70%] relative z-10 ${showMobileChat ? 'block' : 'hidden sm:block'}`}>
        <div className="flex-grow flex flex-col h-[calc(100vh-66px)]">
          {selectedUser ? (
            <>
              {/* Chat Header with Back Button */}
              <div className="py-4 sm:p-4 border-b-2 border-red-200 bg-gradient-to-r from-red-50 to-green-50 flex items-center">
                {showMobileChat && (
                  <button 
                    onClick={handleBackToList}
                    className="mr-1 px-2 sm:hidden"
                  >
                    <img src={assets.exit_icon} alt="" className="w-5 h-5"/>
                  </button>
                )}
                <div className="relative">
                  <img
                    src={assets.avatar_woman}
                    className="w-10 h-10 rounded-full mr-4 border-2 border-green-400"
                    alt="avatar"
                  />
                  <span className="absolute -top-1 -right-2 text-xl"></span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    {selectedUser.username}
                  </h2>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 hidden_scroll bg-gradient-to-b from-red-50/30 to-green-50/30" ref={messagesContainerRef}>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col w-full ${
                      msg.sender === "admin"
                        ? "self-end items-end float-end"
                        : "self-start items-start float-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-[70%] shadow-md relative ${
                        msg.sender === "admin"
                          ? "bg-gradient-to-r from-red-600 to-red-700 text-white"
                          : msg.sender === "bot"
                          ? "bg-gradient-to-r from-blue-100 to-blue-200 text-gray-800 border-2 border-blue-300"
                          : "bg-gradient-to-r from-green-100 to-green-200 text-gray-800"
                      }`}
                    >
                      {msg.sender === "bot" && (
                        <div className="text-xs font-bold text-blue-600 mb-1">AI Bot</div>
                      )}
                      {msg.message}
                    </div>
                    <span className={`text-xs mt-1 ${
                      msg.sender === "admin" ? "text-red-600" : 
                      msg.sender === "bot" ? "text-blue-600" : 
                      "text-green-600"
                    }`}>
                      {moment(msg.timestamp).format("DD/MM HH:mm")}
                    </span>
                  </div>
                ))}
                <div ref={messageEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t-2 border-red-200 bg-gradient-to-r from-red-50 to-green-50 flex items-center space-x-2 mb-2 relative">
                <input
                  type="text"
                  placeholder="Send message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full flex-grow px-3 py-2 border-2 border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                />
                <button 
                  onClick={sendMessage} 
                  className="sm:px-4 sm:py-2 bg-gradient-to-r from-red-600 to-green-600 rounded-full hover:scale-110 transition-transform p-2"
                >
                  <span className="text-white text-xl">Send</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-red-50 to-green-50">
              <div className="text-center">
                <h2 className="mt-4 text-xl text-gray-600 font-semibold">
                  Merry Christmas!
                </h2>
                <p className="text-gray-500 mt-2">
                  Select a user to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
