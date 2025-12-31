import React, { useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { ShopContext } from '../context/ShopContext.jsx';
import { useNavigate } from 'react-router-dom';

const Livestream = () => {
  const videoRef = useRef(null);
  const [streamStarted, setStreamStarted] = useState(false);
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [highlightedProduct, setHighlightedProduct] = useState(null);
  const { products, token } = useContext(ShopContext);
  const [productList, setProductList] = useState([]);
  const peerRef = useRef(null);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    setProductList(products);
  }, [products]);

  // Lấy username từ localStorage (ưu tiên), nếu không có thì lấy từ token
  useEffect(() => {
    const getUserInfo = async () => {
      let storedName = localStorage.getItem('username');
      if (storedName) {
        setUsername(storedName);
        return;
      }
      if (token) {
        try {
          const backendEnv = import.meta.env.VITE_BACKEND_URL;
          const backendUrl = backendEnv === undefined ? 'http://localhost:4000' : (backendEnv || '');
          const response = await fetch(`${backendUrl}/api/users/profile`, {
            headers: {
              'token': token
            }
          });
          const data = await response.json();
          if (data.success && data.user) {
            setUsername(data.user.name || 'Guest');
          } else {
            setUsername('Guest');
          }
        } catch {
          setUsername('Guest');
        }
      } else {
        setUsername('Guest');
      }
    };
    getUserInfo();
  }, [token]);

  useEffect(() => {
    // Tạo socket connection với options giống chat component
    if (!socketRef.current) {
      // Logic: 
      // - Nếu VITE_BACKEND_URL không set (undefined) → local dev → dùng localhost:4000
      // - Nếu VITE_BACKEND_URL là empty string "" → Docker → dùng undefined (relative path)
      const backendEnv = import.meta.env.VITE_BACKEND_URL;
      const socketUrl = backendEnv === undefined ? 'http://localhost:4000' : (backendEnv.trim() || undefined);
      
      socketRef.current = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });
    }
    const socket = socketRef.current;

    // Join livestream room - chỉ join 1 lần
    if (!hasJoinedRef.current && username) {
      console.log('[Client] Joining livestream with username:', username);
      socket.emit('join-livestream', { username });
      hasJoinedRef.current = true;
    }

    // Nhận trạng thái stream
    socket.on('stream-started', () => {
      console.log('[Client] Stream started');
      setStreamStarted(true);
      // Chỉ gửi client-ready nếu chưa có peer connection
      if (!peerRef.current) {
        setTimeout(() => {
          console.log('[Client] Sending client-ready');
          socket.emit('client-ready');
        }, 100);
      }
    });

    socket.on('stream-stopped', () => {
      console.log('[Client] Stream stopped');
      setStreamStarted(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
    });

    // Nhận comment mới
    socket.on('new-comment', (comment) => {
      console.log('[Client] New comment:', comment);
      setComments((prev) => [...prev, comment]);
    });

    // Nhận số lượt tim
    socket.on('like-count', (count) => {
      console.log('[Client] Like count:', count);
      setLikeCount(count);
    });

    // Nhận sản phẩm được highlight
    socket.on('product-highlighted', (product) => {
      console.log('[Client] Product highlighted:', product);
      setHighlightedProduct(product);
    });

    // WebRTC signaling
    socket.on('signal', async (data) => {
      if (data.type === 'offer') {
        console.log('[Client] Received offer');
        // Nếu đã có peer connection, đóng cái cũ
        if (peerRef.current) {
          peerRef.current.close();
        }
        
        const peer = new RTCPeerConnection({
          iceTransportPolicy: 'relay',
          iceServers: [
            {       
                urls: "turn:global.relay.metered.ca:80",
                username: "9bb4d063470965c90fe9e1d1",
                credential: "ESShMclPbJuTHQzA",
              },
              {
                urls: "turn:global.relay.metered.ca:80?transport=tcp",
                username: "9bb4d063470965c90fe9e1d1",
                credential: "ESShMclPbJuTHQzA",
              },
              {
                urls: "turn:global.relay.metered.ca:443",
                username: "9bb4d063470965c90fe9e1d1",
                credential: "ESShMclPbJuTHQzA",
              },
              {
                urls: "turns:global.relay.metered.ca:443?transport=tcp",
                username: "9bb4d063470965c90fe9e1d1",
                credential: "ESShMclPbJuTHQzA",
              },
          ]
        });
        peerRef.current = peer;

        peer.ontrack = (event) => {
          console.log('[Client] Received media stream');
          if (videoRef.current) {
            videoRef.current.srcObject = event.streams[0];
            // Force play video (autoplay might be blocked)
            videoRef.current.play().catch(err => {
              console.error('[Client] Video play error:', err);
              // If autoplay blocked, user needs to click play
            });
          }
        };

        peer.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit('signal', { 
              type: 'candidate', 
              candidate: e.candidate, 
              toAdmin: true 
            });
            console.log('[Client] Sent candidate');
          }
        };

        await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit('signal', { 
          type: 'answer', 
          answer, 
          toAdmin: true 
        });
        console.log('[Client] Sent answer');
      }

      if (data.type === 'candidate' && peerRef.current) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          console.log('[Client] Added ICE candidate');
        } catch (err) {
          console.error('[Client] Error adding ICE candidate:', err);
        }
      }
    });

    return () => {
      console.log('[Client] Cleaning up livestream');
      socket.off('stream-started');
      socket.off('stream-stopped');
      socket.off('new-comment');
      socket.off('like-count');
      socket.off('product-highlighted');
      socket.off('signal');
      
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
      
      // Disconnect socket khi unmount component
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      hasJoinedRef.current = false;
    };
  }, [username]);

  // When sending comment from client, always use the username state (from DB or fallback)
  const handleSend = () => {
    if (input.trim() && socketRef.current) {
      const comment = { text: input, time: new Date().toISOString(), username };
      socketRef.current.emit('send-comment', comment);
      setInput('');
    }
  };

  const handleLike = () => {
    if (socketRef.current) {
      socketRef.current.emit('send-like');
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-[70vh] py-8 px-2 relative">
      {/* Background image with overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: "url('/christmas2.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-white">Livestream</h2>
      {streamStarted ? (
        <div className="w-full max-w-5xl bg-white/95 backdrop-blur-sm rounded-xl shadow-xl flex flex-col md:flex-row overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              muted={false}
              controls
              className="w-full h-[360px] md:h-[480px] object-contain bg-black rounded-xl" 
            />
            {highlightedProduct && (
              <div 
                onClick={() => navigate(`/product/${highlightedProduct._id}`)}
                className="bg-white/90 p-4 rounded shadow my-4 flex items-center gap-3 w-full max-w-md mx-auto cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <img 
                  src={highlightedProduct.image?.[0]} 
                  alt={highlightedProduct.name} 
                  className="w-16 h-16 object-cover rounded" 
                />
                <div>
                  <b>Highlighted product:</b> {highlightedProduct.name}
                  <div className="text-red-600 font-bold">{highlightedProduct.price} {highlightedProduct.currency || '$'}</div>
                  <div className="text-xs text-blue-600 mt-1">👆 Click to view details</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col justify-between p-4 w-full md:w-96 border-l border-gray-200 bg-gradient-to-b from-white to-gray-50">
            <div className="flex items-center gap-4 mb-4">
              <button onClick={handleLike} className="text-red-500 text-2xl">❤️</button>
              <span>{likeCount}</span>
              <span className="text-gray-500">likes</span>
            </div>
            
            <div className="mb-4 max-h-60 overflow-y-auto bg-white/80 rounded p-2 flex-1">
              {comments.map((c, i) => (
                <div key={i} className="text-left text-sm mb-1">
                  <b>{c.username || 'Guest'}:</b> {c.text}
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 mt-2">
              <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                className="border rounded px-2 py-1 flex-1" 
                placeholder="Comment..." 
              />
              <button 
                onClick={handleSend} 
                className="christmas-btn-primary"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
          <div className="text-6xl mb-4">📺</div>
          <div className="text-gray-700 font-semibold text-lg">No livestream is active</div>
          <div className="text-gray-600 text-sm mt-2">Please check back later!</div>
        </div>
      )}
    </div>
  );
};

export default Livestream;