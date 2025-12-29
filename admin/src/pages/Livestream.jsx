import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { backendUrl } from '../App';
import io from 'socket.io-client';

// Tạo socket connection với options đúng cho cả local dev và Docker
// - Local dev: VITE_BACKEND_URL undefined → 'http://localhost:4000'
// - Docker: VITE_BACKEND_URL = "" → undefined (relative path qua nginx)
const backendEnv = import.meta.env.VITE_BACKEND_URL;
const socketUrl = backendEnv === undefined ? 'http://localhost:4000' : (backendEnv.trim() || undefined);

const socket = io(socketUrl, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

const AdminLivestream = () => {
  const videoRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [productId, setProductId] = useState('');
  const [products, setProducts] = useState([]);
  const [comments, setComments] = useState([]);
  const [likeCount, setLikeCount] = useState(0);
  const [connectedClients, setConnectedClients] = useState([]);
  const peersRef = useRef({});

  useEffect(() => {
    // Fetch all products in shop
    axios.get(backendUrl + '/api/product/list')
      .then(res => {
        if (res.data.success) setProducts(res.data.products);
      });
  }, []);

  useEffect(() => {
    // Admin join room - chỉ emit 1 lần
    socket.emit('admin-join');
    console.log('[Admin] Joined admin room');

    // Lắng nghe client ready
    const handleClientReady = ({ clientId }) => {
      console.log('[Admin] Client ready:', clientId);
      setConnectedClients(prev => {
        if (!prev.includes(clientId)) {
          return [...prev, clientId];
        }
        return prev;
      });
    };

    // Lắng nghe client disconnect
    const handleClientDisconnected = ({ clientId }) => {
      console.log('[Admin] Client disconnected:', clientId);
      setConnectedClients(prev => prev.filter(id => id !== clientId));
      if (peersRef.current[clientId]) {
        peersRef.current[clientId].close();
        delete peersRef.current[clientId];
      }
    };

    // Nhận comment
    const handleComment = (comment) => {
      console.log('[Admin] New comment:', comment);
      setComments(prev => [...prev, comment]);
    };

    // Nhận like count
    const handleLikeCount = (count) => {
      console.log('[Admin] Like count:', count);
      setLikeCount(count);
    };

    // WebRTC signaling
    const handleSignal = async (data) => {
      const { clientId, type } = data;
      
      if (type === 'answer' && peersRef.current[clientId]) {
        try {
          await peersRef.current[clientId].setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
          console.log('[Admin] Set remote description for client:', clientId);
        } catch (err) {
          console.error('[Admin] Error setting remote description:', err);
        }
      }
      
      if (type === 'candidate' && peersRef.current[clientId]) {
        try {
          await peersRef.current[clientId].addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
          console.log('[Admin] Added ICE candidate for client:', clientId);
        } catch (err) {
          console.error('[Admin] Error adding ICE candidate:', err);
        }
      }
    };

    socket.on('client-ready', handleClientReady);
    socket.on('client-disconnected', handleClientDisconnected);
    socket.on('new-comment', handleComment);
    socket.on('like-count', handleLikeCount);
    socket.on('signal', handleSignal);

    return () => {
      socket.off('client-ready', handleClientReady);
      socket.off('client-disconnected', handleClientDisconnected);
      socket.off('new-comment', handleComment);
      socket.off('like-count', handleLikeCount);
      socket.off('signal', handleSignal);
    };
  }, []);

  // Create peer connection for new client
  const createPeerConnection = async (clientId, stream) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443?transport=tcp',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ]
    });
    
    peersRef.current[clientId] = peer;
    
    stream.getTracks().forEach(track => peer.addTrack(track, stream));
    
    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('signal', { 
          type: 'candidate', 
          candidate: e.candidate, 
          clientId 
        });
        console.log('[Admin] Sent candidate to client:', clientId);
      }
    };

    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit('signal', { 
        type: 'offer', 
        offer, 
        clientId 
      });
      console.log('[Admin] Sent offer to client:', clientId);
    } catch (err) {
      console.error('[Admin] Error creating offer:', err);
    }
  };

  // Handle stream start
  const handleStartStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setStreaming(true);
      setComments([]);
      setLikeCount(0);
      
      socket.emit('admin-start-stream');
      console.log('[Admin] Stream started');
    } catch (err) {
      console.error('[Admin] Error accessing media:', err);
      alert('Cannot access camera/microphone. Please check your permissions.');
    }
  };

  // Handle stream stop
  const handleStopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    Object.values(peersRef.current).forEach(peer => peer.close());
    peersRef.current = {};
    
    setStreaming(false);
    setConnectedClients([]);
    socket.emit('admin-stop-stream');
    console.log('[Admin] Stream stopped');
  };

  // Create peer connections when streaming and clients connect
  useEffect(() => {
    if (streaming && videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      connectedClients.forEach(clientId => {
        if (!peersRef.current[clientId]) {
          createPeerConnection(clientId, stream);
        }
      });
    }
  }, [streaming, connectedClients]);

  const handleHighlightProduct = () => {
    const product = products.find(p => p._id === productId);
    if (product) {
      socket.emit('highlight-product', product);
      console.log('[Admin] Highlighted product:', product);
    }
  };

  return (
    <div className="admin-livestream p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Livestream Control</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="relative">
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline
                className="w-full h-[400px] object-contain bg-black rounded-lg" 
              />
              {streaming && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg">
                  <span className="animate-pulse">🔴</span>
                  LIVE
                </div>
              )}
              <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full font-semibold">
                 {connectedClients.length} viewers
              </div>
            </div>
            
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleStartStream}
                disabled={streaming}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              >
                Start Stream
              </button>
              <button
                onClick={handleStopStream}
                disabled={!streaming}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              >
                Stop Stream
              </button>
            </div>
          </div>
        </div>

        {/* Chat & Likes Panel */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
            <div className="text-3xl">❤️</div>
            <div className="text-2xl font-bold text-red-600">{likeCount}</div>
            <span className="text-gray-500">likes</span>
          </div>
          
          {/* Comment section (English, show user name) */}
          <h3 className="font-bold text-lg mb-3">💬 Comments ({comments.length})</h3>
          <div className="max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-3 space-y-2">
            {comments.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                No comments yet
              </div>
            ) : (
              comments.map((comment, index) => (
                <div 
                  key={index} 
                  className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-blue-600">
                      {comment.username || 'Guest'}:
                    </span>
                    <span className="text-gray-800">{comment.text}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Product Highlight Section */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Highlight Product</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-4">
          {products.map(product => (
            <div
              key={product._id}
              className={`p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                productId === product._id 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setProductId(product._id)}
            >
              <img 
                src={product.image?.[0]} 
                alt={product.name} 
                className="w-full h-32 object-cover rounded mb-2"
              />
              <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                {product.name}
              </h4>
              <p className="text-red-600 font-bold">
                {product.price} {product.currency || '$'}
              </p>
            </div>
          ))}
        </div>
        <button
          onClick={handleHighlightProduct}
          disabled={!productId || !streaming}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
        >
          Highlight selected product
        </button>
      </div>
    </div>
  );
};

export default AdminLivestream;