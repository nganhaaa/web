// controllers/livestreamController.js
// Livestream socket logic: admin broadcast, multiple clients view, chat, like, product highlight

let adminSocketId = null;
let likeCount = 0;
const clientsInRoom = new Map(); // clientId -> username
let isStreaming = false;
let currentHighlightedProduct = null; // Lưu sản phẩm đang được highlight

export function handleLivestreamConnection(socket, io) {
  let isAdmin = false;
  let clientUsername = 'Khách';

  // Admin joins
  socket.on('admin-join', () => {
    isAdmin = true;
    adminSocketId = socket.id;
    socket.join('livestream-admin');
    likeCount = 0;
    console.log('[Server] Admin joined livestream-admin:', socket.id);
  });

  // Client joins livestream room
  socket.on('join-livestream', (data) => {
    clientUsername = data?.username || 'Khách';
    socket.join('livestream');
    clientsInRoom.set(socket.id, clientUsername);
    
    console.log(`[Server] Client ${clientUsername} (${socket.id}) joined. Total: ${clientsInRoom.size}`);
    
    // Send current like count to new client
    socket.emit('like-count', likeCount);
    
    // Send current highlighted product to new client (nếu có)
    if (currentHighlightedProduct) {
      console.log('[Server] Sending current highlighted product to new client:', currentHighlightedProduct.name);
      socket.emit('product-highlighted', currentHighlightedProduct);
    }
    
    // If stream is already running, notify this client
    if (isStreaming) {
      console.log('[Server] Stream is already running, notifying new client');
      socket.emit('stream-started');
    }
    
    // Notify admin about new client count
    if (adminSocketId) {
      io.to(adminSocketId).emit('client-count', clientsInRoom.size);
    }
  });

  // Client is ready to receive stream
  socket.on('client-ready', () => {
    console.log('[Server] Client ready signal from:', socket.id);
    // Notify admin that this specific client is ready for WebRTC
    if (adminSocketId) {
      io.to(adminSocketId).emit('client-ready', { 
        clientId: socket.id,
        username: clientUsername 
      });
    }
  });

  // Admin starts stream
  socket.on('admin-start-stream', () => {
    isStreaming = true;
    console.log('[Server] Admin started stream. Broadcasting to', clientsInRoom.size, 'clients');
    // Notify all clients in livestream room
    io.to('livestream').emit('stream-started');
  });

  // Admin stops stream
  socket.on('admin-stop-stream', () => {
    isStreaming = false;
    likeCount = 0;
    currentHighlightedProduct = null; // Clear highlighted product khi stop stream
    console.log('[Server] Admin stopped stream');
    io.to('livestream').emit('stream-stopped');
    io.to('livestream').emit('like-count', 0);
    if (adminSocketId) {
      io.to(adminSocketId).emit('like-count', 0);
    }
  });

  // Admin highlights a product
  socket.on('highlight-product', (product) => {
    currentHighlightedProduct = product; // Lưu sản phẩm được highlight
    console.log('[Server] Product highlighted:', product.name);
    io.to('livestream').emit('product-highlighted', product);
    if (adminSocketId) {
      io.to(adminSocketId).emit('product-highlighted', product);
    }
  });

  // Client sends comment
  socket.on('send-comment', (comment) => {
    const commentWithUser = {
      ...comment,
      username: clientUsername,
      timestamp: Date.now()
    };
    console.log('[Server] Comment from', clientUsername);
    
    // Broadcast to all clients
    io.to('livestream').emit('new-comment', commentWithUser);
    // Send to admin
    if (adminSocketId) {
      io.to(adminSocketId).emit('new-comment', commentWithUser);
    }
  });

  // Client sends like
  socket.on('send-like', () => {
    likeCount++;
    console.log('[Server] Like received. Total:', likeCount);
    
    // Broadcast to everyone
    io.to('livestream').emit('like-count', likeCount);
    if (adminSocketId) {
      io.to(adminSocketId).emit('like-count', likeCount);
    }
  });

  // WebRTC signaling
  socket.on('signal', (data) => {
    if (isAdmin && data.clientId) {
      // Admin -> Client
      console.log('[Server] Admin->Client signal:', data.type, 'to', data.clientId);
      io.to(data.clientId).emit('signal', {
        type: data.type,
        offer: data.offer,
        candidate: data.candidate
      });
    } else if (!isAdmin && data.toAdmin && adminSocketId) {
      // Client -> Admin
      console.log('[Server] Client->Admin signal:', data.type, 'from', socket.id);
      io.to(adminSocketId).emit('signal', {
        type: data.type,
        answer: data.answer,
        candidate: data.candidate,
        clientId: socket.id
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (isAdmin) {
      console.log('[Server] Admin disconnected');
      adminSocketId = null;
      isStreaming = false;
      likeCount = 0;
      currentHighlightedProduct = null; // Clear khi admin disconnect
      io.to('livestream').emit('stream-stopped');
    } else if (clientsInRoom.has(socket.id)) {
      const username = clientsInRoom.get(socket.id);
      clientsInRoom.delete(socket.id);
      console.log(`[Server] Client ${username} disconnected. Remaining: ${clientsInRoom.size}`);
      
      // Notify admin
      if (adminSocketId) {
        io.to(adminSocketId).emit('client-disconnected', { clientId: socket.id });
        io.to(adminSocketId).emit('client-count', clientsInRoom.size);
      }
    }
  });
}