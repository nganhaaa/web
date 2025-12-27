import { useState, useEffect, useCallback, useMemo, useRef, useContext } from "react";
import { ShopContext } from '../../context/ShopContext';
import { io } from "socket.io-client";
import { assets } from "../../assets/assets";
import moment from "moment";
import { Link } from "react-router-dom";

const ChatBox = () => {
  const { userId } = useContext(ShopContext);

  const [isActive, setIsActive] = useState(false);
  const [enterMessage, setEnterMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef(null);  
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null); // Use ref to store socket instance

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
  }, [messages,isActive]);

  const onCloseModel = useCallback(() => {
    setIsActive(false);
  }, []);

  const onOpenModel = useCallback(() => {
    setIsActive(true);
  }, []);

  const isActiveSendButton = useMemo(() => {
    return enterMessage.length > 0;
  }, [enterMessage]);

  // Fetch previous messages and handle real-time messages
  useEffect(() => {
    if (!userId) return;

    // Initialize socket connection only once
    if (!socketRef.current) {
      // Khi deploy, sử dụng relative path để Socket.IO tự động dùng cùng domain
      // Khi dev, sử dụng URL đầy đủ
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
      // Nếu URL là localhost không có port (deploy), sử dụng relative path
      // undefined sẽ khiến Socket.IO tự động dùng cùng origin với trang web
      const socketUrl = (backendUrl === 'http://localhost' || backendUrl === 'http://localhost/') 
        ? undefined  // undefined = cùng origin (tự động dùng domain hiện tại)
        : backendUrl;
      
      socketRef.current = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });
    }

    const socket = socketRef.current;

    socket.emit("join", {
      userId: userId,
      adminId: "admin",
    });

    const handlePreviousMessages = (msgs) => {
      setMessages(msgs);
    };

    const handlePrivateMessage = (msg) => {
      // CRITICAL: Only accept messages where this user is sender or receiver
      const isForThisUser = 
        (msg.sender === userId && msg.receiver === 'admin') ||
        (msg.sender === 'admin' && msg.receiver === userId) ||
        (msg.sender === 'bot' && msg.receiver === userId);
      
      if (!isForThisUser) {
        console.log('⛔ Ignoring message not for this user:', msg);
        return;
      }
      
      setMessages((prev) => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(m => 
          m.message === msg.message && 
          m.sender === msg.sender && 
          m.receiver === msg.receiver &&
          Math.abs(new Date(m.timestamp) - new Date(msg.timestamp)) < 2000
        );
        if (exists) {
          console.log('⚠️ Duplicate message detected, skipping:', msg);
          return prev;
        }
        return [...prev, msg];
      });
    };

    socket.on("previousMessages", handlePreviousMessages);
    socket.on("privateMessage", handlePrivateMessage);

    return () => {
      socket.off("previousMessages", handlePreviousMessages);
      socket.off("privateMessage", handlePrivateMessage);
    };
  }, [userId]);

  const handleSend = useCallback(() => {
    if (enterMessage.length > 0 && socketRef.current) {
      const newMessage = {
        sender: userId,
        receiver: "admin",
        message: enterMessage,
        timestamp: new Date(),
      };
      // Don't add message to state immediately - wait for server confirmation
      // This prevents duplicate messages
      socketRef.current.emit("privateMessage", newMessage);
      setEnterMessage(""); // Clear input after sending
    }
  }, [enterMessage, userId]);

  const handleKeyDown = (event) => {  
    if (event.key === 'Enter') {  
      event.preventDefault();  
      handleSend();  
    }  
  };  

  if (!isActive) {
    return (
      <div
        onClick={onOpenModel}
        className="cursor-pointer px-4 py-6 items-center gap-2 flex h-10 rounded-lg bg-gradient-to-r from-red-600 to-green-600 fixed bottom-10 right-10 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
        style={{
          boxShadow: '0 0 20px rgba(220, 38, 38, 0.5), 0 0 40px rgba(22, 163, 74, 0.3)'
        }}
      >
        <span className="text-2xl">🎅</span>
        <p className="hidden sm:flex text-white text-[14px] font-bold">Christmas Chat</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0  sm:bottom-10 sm:right-10 z-50">
      <div className="w-screen sm:w-[364px] sm:mb-16 rounded-xl relative h-screen sm:h-[532px] shadow-2xl bg-gradient-to-b from-red-50 to-green-50 overflow-hidden">
        {/* Tuyết rơi trong chatbox */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute text-white opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                fontSize: `${10 + Math.random() * 10}px`,
                animation: `fall ${5 + Math.random() * 5}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            >
              ❄
            </div>
          ))}
        </div>
        
        <div className="h-14 flex justify-center items-center bg-gradient-to-r from-red-600 via-green-600 to-red-600 w-full sm:rounded-t-xl relative">
          <p className="text-white text-base font-bold text-center flex items-center gap-2">
            🎅 Forever - Merry Christmas
          </p>
          <div
            onClick={onCloseModel}
            className="sm:hidden p-2 absolute top-3 right-4"
          >
            <img
              className="w-4 h-auto fill-white scale-125"
              src={assets.cancel_icon}
            />
          </div>
        </div>
        {userId ? (
          // Nội dung chat khi đã đăng nhập
          <>
            <div className="flex flex-col h-[82%] sm:h-[78%] p-4 overflow-y-auto gap-2" ref={messagesContainerRef}>
              {messages.map((msg, idx) => {
                const isBot = msg.sender === 'bot' || msg.sender === 'admin';
                const isUser = msg.sender === userId;
                
                return (
                  <div
                    key={idx}
                    className={`mb-1 flex ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`${
                        isUser
                          ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                          : msg.sender === 'bot'
                          ? "bg-gradient-to-r from-blue-100 to-blue-200 text-gray-800 shadow-md border-2 border-blue-300"
                          : "bg-gradient-to-r from-green-100 to-green-200 text-gray-800 shadow-md"
                      } text-base p-3 rounded-2xl max-w-[70%] break-words relative`}
                    >
                      {!isUser && (
                        <span className="absolute -left-2 -top-2 text-xl">
                          {msg.sender === 'bot' ? '🤖' : '�'}
                        </span>
                      )}
                      {msg.sender === 'bot' && (
                        <div className="text-xs font-bold text-blue-600 mb-1">AI Bot</div>
                      )}
                      <p>{msg.message}</p>
                      <span className={`text-xs ${
                        isUser ? 'text-red-200' : 
                        msg.sender === 'bot' ? 'text-blue-600' : 'text-green-600'
                      } block mt-1`}>
                        {moment(msg.timestamp).format("HH:mm DD-MM")}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messageEndRef} />
            </div>

            <div className="px-2 relative">
              <div className="w-full border-2 border-red-200 h-[16%] rounded-xl bg-white mt-3 p-2 flex shadow-md">
                <input
                  value={enterMessage}
                  onChange={(e) => setEnterMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Send message..."
                  className="text base border-0 outline-none w-[90%] focus:ring-0 hover:border-gray-300 py-3 sm:py-0"
                />
                <div
                  onClick={handleSend}
                  className={`flex justify-end items-center w-[10%] ${
                    isActiveSendButton ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-green-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                    <span className="text-white text-sm">➤</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Login notification
          <div className="flex flex-col items-center justify-center h-[82%] sm:h-[78%] p-4">
            <div className="text-6xl mb-4 animate-bounce">🎅</div>
            <p className="text-lg text-gray-700 text-center mb-2">
              Christmas Season is Here!
            </p>
            <p className="text-base text-gray-500 text-center">
              Please <strong className="underline text-red-600"> <Link to='/login'>login </Link></strong> to chat with us
            </p>
          </div>
        )}
      </div>
      <div
        onClick={onCloseModel}
        className="hidden cursor-pointer p-3 rounded-full items-center gap-1 sm:flex h-12 w-12 fixed bottom-10 right-10 bg-gradient-to-r from-red-600 to-green-600 shadow-lg hover:shadow-xl transition-all duration-300"
        style={{
          boxShadow: '0 0 20px rgba(220, 38, 38, 0.5)'
        }}
      >
        <img
          className="w-5 h-auto fill-white scale-125"
          src={assets.cancel_icon}
        />
      </div>
    </div>
  );
};

export default ChatBox;
