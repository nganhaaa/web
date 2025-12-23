import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../components/ChristmasTheme.css';

const Vouchers = () => {
  const { backendUrl, token, navigate } = useContext(ShopContext);
  const [activeTab, setActiveTab] = useState('available');
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [myVouchers, setMyVouchers] = useState({ active: [], used: [], expired: [] });
  const [savedVoucherIds, setSavedVoucherIds] = useState(new Set());

  // Daily Spin states
  const [canSpin, setCanSpin] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [rotation, setRotation] = useState(0);

  const fetchAvailableVouchers = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/voucher/all');
      if (response.data.success) {
        setAvailableVouchers(response.data.vouchers);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchMyVouchers = async () => {
    if (!token) return;
    try {
      const response = await axios.post(
        backendUrl + '/api/voucher/user',
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setMyVouchers({
          active: response.data.active,
          used: response.data.used,
          expired: response.data.expired
        });

        // Track which vouchers are already saved
        const savedIds = new Set();
        response.data.active.forEach(uv => savedIds.add(uv.voucherId._id));
        response.data.used.forEach(uv => savedIds.add(uv.voucherId._id));
        response.data.expired.forEach(uv => savedIds.add(uv.voucherId._id));
        setSavedVoucherIds(savedIds);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkSpinStatus = async () => {
    if (!token) return;
    try {
      const response = await axios.post(
        backendUrl + '/api/spin/check',
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setCanSpin(response.data.canSpin);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSpin = async () => {
    if (!canSpin || isSpinning) return;

    setIsSpinning(true);
    setSpinResult(null);

    try {
      const response = await axios.post(
        backendUrl + '/api/spin/spin',
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        const spins = 5;
        const extraDegrees = Math.random() * 360;
        const totalRotation = rotation + (360 * spins) + extraDegrees;

        setRotation(totalRotation);

        setTimeout(() => {
          setSpinResult(response.data.result);
          setCanSpin(false);
          setIsSpinning(false);

          if (response.data.result.type === 'voucher') {
            toast.success(response.data.result.message);
            fetchMyVouchers();
          } else {
            toast.info(response.data.result.message);
          }
        }, 4000);
      } else {
        toast.error(response.data.message);
        setIsSpinning(false);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to spin. Please try again!');
      setIsSpinning(false);
    }
  };

  const saveVoucher = async (voucherId) => {
    if (!token) {
      toast.error('Please login to save vouchers');
      navigate('/login');
      return;
    }
    try {
      const response = await axios.post(
        backendUrl + '/api/voucher/save',
        { voucherId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Voucher saved successfully!');
        fetchMyVouchers();
        fetchAvailableVouchers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Failed to save voucher');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('📋 Code copied!');
  };

  useEffect(() => {
    fetchAvailableVouchers();
    if (token) {
      fetchMyVouchers();
      checkSpinStatus();
    }
  }, [token]);

  const VoucherCard = ({ voucher, showSaveButton = false, status = null }) => {
    const voucherData = voucher.voucherId || voucher;
    const isSaved = savedVoucherIds.has(voucherData._id);

    // Calculate usage percentage
    const usagePercentage = Math.round((voucherData.usedCount / voucherData.usageLimit) * 100);
    
    // Determine if voucher is inactive or expired
    const isInactive = voucherData.isActive === false;
    const isExpired = new Date(voucherData.expiryDate) < new Date();
    
    let statusDisplay = status;
    let statusLabel = '';
    let statusClass = '';
    
    if (status === 'expired' || status === 'inactive') {
      if (isInactive) {
        statusLabel = '🚫 Inactive';
        statusClass = 'bg-orange-100 text-orange-700';
      } else if (isExpired) {
        statusLabel = '⏰ Expired';
        statusClass = 'bg-red-100 text-red-700';
      }
    } else if (status === 'saved') {
      statusLabel = 'Active';
      statusClass = 'bg-green-100 text-green-700';
    } else if (status === 'used') {
      statusLabel = '✔️ Used';
      statusClass = 'bg-gray-100 text-gray-700';
    }

    return (
      <div className="border-2 border-gold-400 rounded-lg p-4 bg-gradient-to-r from-red-50 to-yellow-50 hover:shadow-lg transition">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎟️</span>
              <h3 className="font-bold text-lg text-red-700">{voucherData.code}</h3>
            </div>
            <p className="text-gray-700 text-sm mt-1">{voucherData.description}</p>
          </div>
          {statusLabel && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
              {statusLabel}
            </span>
          )}
        </div>

        <div className="mt-3 space-y-1 text-sm">
          <p className="text-red-600 font-semibold">
            💰 {voucherData.discountType === 'percentage'
              ? `${voucherData.discountValue}% OFF`
              : `$${voucherData.discountValue} OFF`}
          </p>
          <p className="text-gray-600">
            📦 Min order: ${voucherData.minOrderAmount || 0}
          </p>
          <p className="text-gray-600">
            🏷️ Categories: {voucherData.applicableCategories?.join(', ') || 'All'}
          </p>
          <p className="text-gray-600">
            📅 Valid until: {new Date(voucherData.expiryDate).toLocaleDateString()}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-gray-600">🎯 Used: {usagePercentage}%</p>
            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
              <div
                className={`h-2 rounded-full ${usagePercentage >= 90 ? 'bg-red-500' : usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => copyCode(voucherData.code)}
            className="flex-1 bg-white border-2 border-gold-400 text-gray-700 px-4 py-2 rounded-lg hover:bg-gold-50 transition font-semibold"
          >
            Copy Code
          </button>
          {showSaveButton && (
            <button
              onClick={() => saveVoucher(voucherData._id)}
              disabled={isSaved}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                isSaved
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'christmas-btn-primary'
              }`}
            >
              {isSaved ? 'Saved' : 'Save'}
            </button>
          )}
        </div>
      </div>
    );
  };

  const prizes = [
    { label: '1%', color: '#FF6B9D', discount: 1, emoji: '🎁' },
    { label: 'Try Again', color: '#95E1D3', discount: 0, emoji: '🔄' },
    { label: '2%', color: '#FFD93D', discount: 2, emoji: '⭐' },
    { label: 'Try Again', color: '#6BCB77', discount: 0, emoji: '🔄' },
    { label: '5%', color: '#4D96FF', discount: 5, emoji: '🎊' },
    { label: 'Try Again', color: '#FE6244', discount: 0, emoji: '🔄' },
    { label: '10%', color: '#9B59B6', discount: 10, emoji: '💎' },
    { label: 'Try Again', color: '#3498DB', discount: 0, emoji: '🔄' },
  ];

  return (
    <div className="border-t pt-10 min-h-screen">
      <div className="text-2xl mb-6">
        <Title text1={'DISCOUNT'} text2={'VOUCHERS'} />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b-2 border-gold-300">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'available'
              ? 'text-red-700 border-b-4 border-red-700'
              : 'text-gray-600 hover:text-red-700'
          }`}
        >
          🎁 Available
        </button>
        <button
          onClick={() => {
            if (!token) {
              toast.error('Please login to spin!');
              navigate('/login');
              return;
            }
            setActiveTab('spin');
          }}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'spin'
              ? 'text-red-700 border-b-4 border-red-700'
              : 'text-gray-600 hover:text-red-700'
          }`}
        >
          🎡 Daily Spin
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'my'
              ? 'text-red-700 border-b-4 border-red-700'
              : 'text-gray-600 hover:text-red-700'
          }`}
        >
          💼 My Vouchers
        </button>
      </div>

      {/* Available Vouchers Tab */}
      {activeTab === 'available' && (
        <div>
          {availableVouchers.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No vouchers available 😔</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableVouchers.map((voucher) => (
                <VoucherCard key={voucher._id} voucher={voucher} showSaveButton={true} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Daily Spin Tab */}
      {activeTab === 'spin' && (
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 bg-gradient-to-r from-red-100 via-yellow-100 to-red-100 p-6 rounded-2xl border-4 border-gold-400 shadow-lg">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600 mb-3">
              🎡 Daily Lucky Spin 🎡
            </h2>
            <p className="text-lg text-gray-700 font-semibold">
              ✨ Spin once per day for amazing discount vouchers! ✨
            </p>
            <p className="text-sm text-red-600 mt-2 font-medium">
              ⏰ Vouchers expire at midnight today - Use them quickly!
            </p>
          </div>

          <div className="flex flex-col items-center justify-center mb-10">
      
          
            
            <div className="relative mb-8">
              {/* Glow effect */}
              <div className={`absolute inset-0 rounded-full blur-2xl ${isSpinning ? 'animate-pulse bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400' : 'bg-gold-200'}`}></div>
              
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 z-20 drop-shadow-2xl">
                <div className="relative">
                  <div className="w-0 h-0 border-l-[25px] border-r-[25px] border-t-[50px] border-l-transparent border-r-transparent border-t-red-600"></div>
                 
                </div>
              </div>

              {/* Wheel Container with shadow */}
              <div className="relative">
                <div 
                  className="relative w-96 h-96 rounded-full border-[12px] border-gold-500 shadow-2xl overflow-hidden"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                    boxShadow: isSpinning ? '0 0 60px rgba(255, 215, 0, 0.8), 0 0 100px rgba(255, 0, 0, 0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  {prizes.map((prize, index) => {
                    const angle = (360 / prizes.length) * index;
                    return (
                      <div
                        key={index}
                        className="absolute w-1/2 h-1/2 origin-bottom-right"
                        style={{
                          transform: `rotate(${angle}deg)`,
                          clipPath: 'polygon(100% 100%, 0 100%, 50% 0)',
                          backgroundColor: prize.color,
                          left: '50%',
                          top: '0',
                          boxShadow: 'inset 0 0 20px rgba(255,255,255,0.3)'
                        }}
                      >
                        <div
                          className="absolute font-bold text-white drop-shadow-lg"
                          style={{
                            top: '25%',
                            left: '55%',
                            transform: 'rotate(22.5deg)',
                            fontSize: '18px',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                          }}
                        >
                          <div className="text-3xl mb-1">{prize.emoji}</div>
                          <div>{prize.label}</div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Center Circle with gradient */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 border-4 border-white flex items-center justify-center shadow-2xl">
                    <span className="text-4xl animate-spin" style={{ animationDuration: '3s' }}>⭐</span>
                  </div>
                </div>
                
                {/* Outer ring decoration */}
                <div className="absolute inset-0 rounded-full" style={{
                  background: 'conic-gradient(from 0deg, #FFD700 0deg 45deg, transparent 45deg 90deg, #FFD700 90deg 135deg, transparent 135deg 180deg, #FFD700 180deg 225deg, transparent 225deg 270deg, #FFD700 270deg 315deg, transparent 315deg 360deg)',
                  transform: 'scale(1.08)',
                  zIndex: -1,
                  opacity: 0.3
                }}></div>
              </div>
            </div>

            {/* Spin Button with enhanced design */}
            <button
              onClick={handleSpin}
              disabled={!canSpin || isSpinning}
              className={`mt-8 px-16 py-5 text-2xl font-black rounded-full transition-all transform shadow-2xl ${
                canSpin && !isSpinning
                  ? 'bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 text-white hover:scale-110 hover:shadow-3xl animate-pulse'
                  : 'bg-gray-400 text-gray-700 cursor-not-allowed'
              }`}
              style={{
                boxShadow: canSpin && !isSpinning ? '0 10px 40px rgba(255, 0, 0, 0.5)' : 'none'
              }}
            >
              {isSpinning ? (
                <span className="flex items-center gap-3">
                  <span className="animate-spin text-3xl">🎡</span>
                  SPINNING...
                  <span className="animate-spin text-3xl">🎡</span>
                </span>
              ) : canSpin ? (
                <span className="flex items-center gap-3">
                  <span className="text-3xl">🎲</span>
                  SPIN NOW!
                  <span className="text-3xl">🎲</span>
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <span className="text-3xl">⏰</span>
                  COME BACK TOMORROW!
                </span>
              )}
            </button>
          </div>

          {spinResult && (
            <div className={`border-4 rounded-2xl p-8 text-center shadow-2xl transform scale-105 ${
              spinResult.type === 'voucher' 
                ? 'border-green-500 bg-gradient-to-br from-green-50 to-yellow-50 animate-bounce' 
                : 'border-gray-400 bg-gradient-to-br from-gray-50 to-blue-50'
            }`}>
              <div className="text-6xl mb-4 animate-bounce">
                {spinResult.type === 'voucher' ? '🎉' : '😢'}
              </div>
              <h3 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                {spinResult.message}
              </h3>
              {spinResult.type === 'voucher' && (
                <div className="bg-white border-4 border-green-500 rounded-xl p-6 inline-block shadow-xl">
                  <p className="text-sm text-gray-600 mb-2 font-semibold">🎟️ Your Voucher Code:</p>
                  <p className="text-4xl font-black text-green-600 mb-3 tracking-wider">{spinResult.voucherCode}</p>
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                    <span className="text-2xl">✅</span>
                    <p className="text-sm font-semibold">Auto-saved to My Vouchers</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('my')}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition shadow-lg"
                  >
                    View My Vouchers 👉
                  </button>
                </div>
              )}
              {spinResult.type === 'nothing' && (
                <div className="mt-4">
                  <p className="text-gray-600 text-lg mb-3">Don't give up! Try again tomorrow! 💪</p>
                  <p className="text-sm text-gray-500">Better luck next time! 🍀</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* My Vouchers Tab */}
      {activeTab === 'my' && (
        <div>
          {!token ? (
            <div className="text-center py-10">
              <p className="text-gray-600 mb-4">Please login to view your vouchers</p>
              <button
                onClick={() => navigate('/login')}
                className="christmas-btn-primary px-8 py-3"
              >
                Login
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Active Vouchers */}
              <div>
                <h3 className="text-xl font-bold text-green-700 mb-4">✅ Active ({myVouchers.active.length})</h3>
                {myVouchers.active.length === 0 ? (
                  <p className="text-gray-500">No active vouchers</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myVouchers.active.map((uv) => (
                      <VoucherCard key={uv._id} voucher={uv} status="saved" />
                    ))}
                  </div>
                )}
              </div>

              {/* Used Vouchers */}
              <div>
                <h3 className="text-xl font-bold text-gray-700 mb-4">✔️ Used ({myVouchers.used.length})</h3>
                {myVouchers.used.length === 0 ? (
                  <p className="text-gray-500">No used vouchers</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myVouchers.used.map((uv) => (
                      <VoucherCard key={uv._id} voucher={uv} status="used" />
                    ))}
                  </div>
                )}
              </div>

              {/* Expired/Inactive Vouchers */}
              <div>
                <h3 className="text-xl font-bold text-red-700 mb-4">🚫 Expired/Inactive ({myVouchers.expired.length})</h3>
                {myVouchers.expired.length === 0 ? (
                  <p className="text-gray-500">No expired or inactive vouchers</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myVouchers.expired.map((uv) => (
                      <VoucherCard key={uv._id} voucher={uv} status="expired" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Vouchers;
