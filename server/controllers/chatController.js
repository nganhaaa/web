import ChatMessage from '../models/chatModel.js';
import userModel from '../models/userModel.js';
import { generateAIResponse, shouldRespondWithAI } from '../services/geminiService.js';

const handleConnection = (socket, io) => {
  //   console.log('a user connected');

  // Listen for the join event to send previous messages
  socket.on('join', async ({ userId, adminId }) => {
    socket.join(userId); // Join a room with the user's ID

    // Fetch previous messages between the user and admin
    try {
      const messages = await ChatMessage.find({
        $or: [
          { sender: userId, receiver: adminId },
          { sender: adminId, receiver: userId },
          { sender: 'bot', receiver: userId },
        ],
      });
      socket.emit('previousMessages', messages);
    } catch (error) {
      console.error('Failed to fetch messages', error);
    }
  });

  // Listen for new messages
  socket.on('privateMessage', async (msg) => {
    const message = new ChatMessage(msg);
    await message.save();
    
    // Send the message to receiver and sender
    io.to(msg.receiver).emit('privateMessage', msg);
    io.to(msg.sender).emit('privateMessage', msg);

    // 🤖 AI Auto-response: Only if admin hasn't responded recently
    if (msg.receiver === 'admin' && msg.sender !== 'admin' && shouldRespondWithAI(msg.message, msg.sender)) {
      try {
        // Get conversation history for context (last 10 messages)
        const conversationHistory = await ChatMessage.find({
          $or: [
            { sender: msg.sender, receiver: 'admin' },
            { sender: 'admin', receiver: msg.sender },
            { sender: 'bot', receiver: msg.sender },
          ],
        }).sort({ timestamp: -1 }).limit(10);

        // ⚠️ CHECK: Has admin (real human) responded in the last 30 minutes?
        const ADMIN_ACTIVE_WINDOW = 30 * 60 * 1000; // 30 minutes
        const now = new Date();
        const recentAdminMessage = conversationHistory.find(
          m => m.sender === 'admin' && 
          (now - new Date(m.timestamp)) < ADMIN_ACTIVE_WINDOW
        );

        // If admin has responded recently, DON'T auto-respond (let admin handle)
        if (recentAdminMessage) {
          console.log('⏸️ Admin is handling this chat - Bot paused');
          return;
        }

        // Check if user is asking for human support
        const humanRequestKeywords = ['người thật', 'admin', 'nhân viên', 'quản lý', 'người quản lý', 'con người'];
        const isRequestingHuman = humanRequestKeywords.some(keyword => 
          msg.message.toLowerCase().includes(keyword)
        );

        if (isRequestingHuman) {
          console.log('👤 User requesting human support - Bot will respond once then pause');
          
          // Send a handoff message
          const handoffMessage = {
            sender: 'bot',
            receiver: msg.sender,
            message: 'Dạ, mình đã thông báo cho nhân viên hỗ trợ rồi ạ. Vui lòng đợi trong giây lát, nhân viên sẽ kết nối với bạn ngay! 🙏',
            timestamp: new Date(),
          };
          
          const handoffMsg = new ChatMessage(handoffMessage);
          await handoffMsg.save();
          
          setTimeout(() => {
            io.to(msg.sender).emit('privateMessage', handoffMessage);
            io.to('admin').emit('privateMessage', handoffMessage);
            // Also notify admin channel
            io.to('admin').emit('adminNotification', {
              userId: msg.sender,
              message: '🔔 Khách hàng yêu cầu hỗ trợ từ nhân viên!'
            });
          }, 1000);
          
          return; // Don't send regular AI response
        }

        console.log('🤖 AI Bot is generating response...');

        // Generate AI response
        const aiResponse = await generateAIResponse(msg.message, conversationHistory.reverse());
        
        console.log('✅ AI Bot response generated');

        // Create bot message
        const botMessage = {
          sender: 'bot',
          receiver: msg.sender,
          message: aiResponse,
          timestamp: new Date(),
        };

        // Save bot message to database
        const botMsg = new ChatMessage(botMessage);
        await botMsg.save();

        // Send bot response to user with slight delay for natural feel
        setTimeout(() => {
          io.to(msg.sender).emit('privateMessage', botMessage);
          // Also send to admin room so they can monitor bot responses
          io.to('admin').emit('privateMessage', botMessage);
        }, 1000); // 1 second delay

      } catch (error) {
        console.error('❌ AI Response Error:', error);
        // If AI fails, don't crash - admin can still respond manually
      }
    }
  });

  //   socket.on('disconnect', () => {
  //     console.log('user disconnected');
  //   });
};

// get the list of users who have chatted with the admin and return their usernames
const getUsers = async (req, res) => {
  try {
    const users = await ChatMessage.distinct('sender', { receiver: "admin" });
    const usersWithNames = await Promise.all(users.map(async (userId) => {
      const user = await userModel.findById(userId); 
      return { userId, username: user.name };
    }));
    res.json({ success: true, users: usersWithNames });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export { handleConnection, getUsers };