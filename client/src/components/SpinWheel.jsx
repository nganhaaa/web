import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const PRIZES = [
  { label: '10%', discount: 10, color: '#c41e3a', emoji: '🎁' }, // Red
  { label: '5%', discount: 5, color: '#165b33', emoji: '🎄' },   // Green
  { label: '2%', discount: 2, color: '#ffd700', emoji: '⭐' },   // Gold
  { label: '1%', discount: 1, color: '#ff6b6b', emoji: '🔔' },   // Pink
  { label: 'Try Again', discount: 0, color: '#8b4513', emoji: '🎅' }, // Brown
  { label: '10%', discount: 10, color: '#0f3d22', emoji: '🎁' }, // Dark Green
  { label: '2%', discount: 2, color: '#c41e3a', emoji: '⭐' },   // Red
  { label: 'Try Again', discount: 0, color: '#666', emoji: '❄️' }, // Gray
];

const numSegments = PRIZES.length;
const segmentAngle = 360 / numSegments;

const SpinWheel = ({ onResult }) => {
  const { backendUrl, token, navigate } = useContext(ShopContext);
  const [canSpin, setCanSpin] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [segmentWidth, setSegmentWidth] = useState(0);
  const [selectedPrizeIndex, setSelectedPrizeIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    checkSpinStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  useEffect(() => {
    // Calculate segment width based on wheel radius
    const radius = 200; // Half of 400px wheel diameter
    const radians = segmentAngle * (Math.PI / 180);
    const calculatedWidth = 2 * radius * Math.sin(radians / 2);
    setSegmentWidth(calculatedWidth);
  }, []);

  const checkSpinStatus = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${backendUrl}/api/spin/check`,
        {},
        { headers: { token } }
      );
      if (data.success) {
        setCanSpin(data.canSpin);
      }
    } catch (error) {
      toast.error('Không thể kiểm tra trạng thái spin');
    } finally {
      setLoading(false);
    }
  };

  const handleSpin = async () => {
    if (!canSpin || isSpinning) return;
    setIsSpinning(true);
    setResult(null);
    setSelectedPrizeIndex(null);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/spin/spin`,
        {},
        { headers: { token } }
      );
      if (!data.success) {
        toast.error(data.message || 'Có lỗi xảy ra');
        setIsSpinning(false);
        return;
      }
      
      console.log('Backend response:', data.result);
      
      // Get prize index directly from backend
      const prizeIndex = data.result?.index ?? 0;
      
      console.log('Prize index:', prizeIndex);
      console.log('Landing on:', PRIZES[prizeIndex]);
      
      // Calculate rotation
      const degreesPerSegment = 360 / numSegments;
      const segmentCenterDegree = (prizeIndex * degreesPerSegment) + (degreesPerSegment / 2);
      const targetRotation = 360 - segmentCenterDegree;
      const spins = 360 * 5;
      const totalRotation = rotation + spins + targetRotation;
      
      console.log('Rotating to:', totalRotation);
      
      setRotation(totalRotation);
      
      // Show result after animation completes
      setTimeout(() => {
        setSelectedPrizeIndex(prizeIndex);
        setResult(data.result);
        setCanSpin(false);
        setIsSpinning(false);
        if (onResult) onResult(data.result);
        if (data.result?.type === 'voucher') {
          toast.success('🎉 ' + (data.result.message || 'Chúc mừng bạn đã trúng thưởng!'));
        } else {
          toast.info('🎅 Chúc bạn may mắn lần sau!');
        }
      }, 4000);
    } catch (error) {
      toast.error('Không thể quay. Vui lòng thử lại!');
      setIsSpinning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Pointer Triangle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 z-20">
          <div className="relative">
            <div className="w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-t-[50px] border-t-red-600 drop-shadow-2xl"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-white text-2xl">
            </div>
          </div>
        </div>
        {/* Spinning Wheel */}
        <div 
          className="relative rounded-full overflow-hidden"
          style={{
            width: '400px',
            height: '400px',
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)',
            border: '12px solid #c41e3a',
            boxShadow: '0 0 0 8px #165b33, 0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          {/* Prize Segments */}
          {PRIZES.map((prize, index) => {
            const isSelected = selectedPrizeIndex === index;
            return (
              <div
                key={index}
                className="absolute top-1/2 left-1/2 flex items-center justify-center"
                style={{
                  width: `${segmentWidth}px`,
                  height: '50%',
                  transform: `translate(-50%, -100%) rotate(${index * segmentAngle}deg)`,
                  transformOrigin: 'center bottom',
                  clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)',
                  zIndex: PRIZES.length - index,
                  background: isSelected 
                    ? '#ffd700' 
                    : prize.color,
                  boxShadow: 'inset 0px 0px 0px #bebebe, inset 0px 10px 10px rgba(255,255,255,0.3)',
                }}
              >
                <div 
                  className="flex flex-col items-center justify-center bg-transparent px-2 py-1 rounded"
                  style={{
                    position: 'absolute',
                    top: '30%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <span className="text-3xl mb-1">{prize.emoji}</span>
                  <span className="text-xs font-bold text-white whitespace-nowrap drop-shadow-lg">
                    {prize.label}
                  </span>
                </div>
              </div>
            );
          })}
          {/* Center Circle */}
          <div 
            className="absolute top-1/2 left-1/2 w-[70px] h-[70px] rounded-full bg-white flex items-center justify-center shadow-xl border-4 border-yellow-400"
            style={{
              transform: 'translate(-50%, -50%)',
              zIndex: 100,
              background: 'linear-gradient(135deg, #fffbe6 0%, #ffd700 100%)',
            }}
          >
            <span className="text-4xl" style={{ color: '#ffd700', filter: 'drop-shadow(0 0 6px #ffd700)' }}>⭐</span>
          </div>
        </div>
      </div>
      {/* Spin Button */}
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
      {/* Result Display */}
      {result && (
        <div className={`max-w-2xl mx-auto my-8 p-8 rounded-2xl border-4 text-center animate-[bounce_0.6s_ease-out_2] ${
          result.type === 'voucher' 
            ? 'border-green-600 bg-gradient-to-br from-green-50 to-emerald-50' 
            : 'border-gray-400 bg-gray-50'
        }`}>
          <div className="text-6xl mb-4">
            {result.type === 'voucher' ? '🎉' : '🎅'}
          </div>
          <h3 className="text-3xl font-bold mb-4">
            {result.message || (result.type === 'voucher' ? 'CONGRATULATIONS!' : 'Better luck next time!')}
          </h3>
          {result.type === 'voucher' && (
            <div className="bg-white border-4 border-green-500 rounded-xl p-6 mt-6">
              <p className="text-sm text-gray-600 mb-2">Your Voucher Code:</p>
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 py-4 px-6 rounded-lg mb-4">
                <p className="text-4xl font-black text-green-600 tracking-widest">
                  {result.voucherCode}
                </p>
              </div>
              <p className="text-lg font-semibold text-green-700 mb-2">
                💰 Discount: {result.discount || '??'}% OFF
              </p>
              <p className="text-sm text-red-500 mb-4">
                ⏰ Expires at midnight today!
              </p>
              <button
                onClick={() => navigate('/vouchers')}
                className="christmas-btn-primary px-8 py-3 text-lg"
              >
                View My Vouchers →
              </button>
            </div>
          )}
          {result.type !== 'voucher' && (
            <p className="text-gray-600 text-lg mt-4">
              Don&apos;t give up! Try again tomorrow! 💪🎄
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SpinWheel;