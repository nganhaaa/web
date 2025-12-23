import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../components/ChristmasTheme.css';

const DailySpin = () => {
  const { backendUrl, token, navigate } = useContext(ShopContext);
  const [canSpin, setCanSpin] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    checkSpinStatus();
  }, [token]);

  const checkSpinStatus = async () => {
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
    setResult(null);
    
    try {
      const response = await axios.post(
        backendUrl + '/api/spin/spin',
        {},
        { headers: { token } }
      );
      
      if (response.data.success) {
        // Animate wheel spinning
        const spins = 5; // Number of full rotations
        const extraDegrees = Math.random() * 360; // Random stop position
        const totalRotation = rotation + (360 * spins) + extraDegrees;
        
        setRotation(totalRotation);
        
        // Show result after animation
        setTimeout(() => {
          setResult(response.data.result);
          setCanSpin(false);
          setIsSpinning(false);
          
          if (response.data.result.type === 'voucher') {
            toast.success(response.data.result.message);
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

  const prizes = [
    { label: '1%', color: '#FFD700', discount: 1 },
    { label: 'Next Time', color: '#FF6B6B', discount: 0 },
    { label: '2%', color: '#4ECDC4', discount: 2 },
    { label: 'Next Time', color: '#FF6B6B', discount: 0 },
    { label: '5%', color: '#95E1D3', discount: 5 },
    { label: 'Next Time', color: '#FF6B6B', discount: 0 },
    { label: '10%', color: '#F38181', discount: 10 },
    { label: 'Next Time', color: '#FF6B6B', discount: 0 },
  ];

  return (
    <div className="border-t pt-10 min-h-screen">
      <div className="text-2xl mb-6">
        <Title text1={'DAILY'} text2={'LUCKY SPIN 🎡'} />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-red-600 mb-2">
            🎁 Spin & Win Daily Vouchers! 🎁
          </h2>
          <p className="text-gray-600">
            Spin once per day for a chance to win discount vouchers!
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Vouchers expire at midnight today ⏰
          </p>
        </div>

        {/* Wheel Container */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 z-10">
              <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[40px] border-l-transparent border-r-transparent border-t-red-600"></div>
            </div>

            {/* Wheel */}
            <div 
              className="relative w-80 h-80 rounded-full border-8 border-gold-400 shadow-2xl overflow-hidden"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
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
                    }}
                  >
                    <div
                      className="absolute font-bold text-white text-lg"
                      style={{
                        top: '30%',
                        left: '60%',
                        transform: 'rotate(22.5deg)'
                      }}
                    >
                      {prize.label}
                    </div>
                  </div>
                );
              })}
              
              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white border-4 border-gold-400 flex items-center justify-center shadow-lg">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </div>

          {/* Spin Button */}
          <button
            onClick={handleSpin}
            disabled={!canSpin || isSpinning}
            className={`mt-8 px-12 py-4 text-xl font-bold rounded-full transition-all transform hover:scale-105 ${
              canSpin && !isSpinning
                ? 'christmas-btn-primary shadow-lg'
                : 'bg-gray-400 text-gray-700 cursor-not-allowed'
            }`}
          >
            {isSpinning ? '🎡 SPINNING...' : canSpin ? '🎲 SPIN NOW!' : '⏰ COME BACK TOMORROW!'}
          </button>
        </div>

        {/* Result Display */}
        {result && (
          <div className={`border-4 rounded-lg p-6 text-center animate-bounce ${
            result.type === 'voucher' ? 'border-green-500 bg-green-50' : 'border-gray-400 bg-gray-50'
          }`}>
            <h3 className="text-2xl font-bold mb-3">
              {result.message}
            </h3>
            {result.type === 'voucher' && (
              <div className="bg-white border-2 border-green-500 rounded-lg p-4 inline-block">
                <p className="text-sm text-gray-600 mb-1">Your Voucher Code:</p>
                <p className="text-3xl font-bold text-green-600">{result.voucherCode}</p>
                <p className="text-sm text-gray-600 mt-2">✅ Auto-saved to My Vouchers</p>
                <button
                  onClick={() => navigate('/vouchers')}
                  className="mt-4 christmas-btn-primary px-6 py-2"
                >
                  View My Vouchers
                </button>
              </div>
            )}
            {result.type === 'nothing' && (
              <p className="text-gray-600 mt-2">Don't give up! Try again tomorrow! 💪</p>
            )}
          </div>
        )}

        {/* Rules */}
        <div className="mt-12 border-2 border-gold-400 rounded-lg p-6 bg-yellow-50">
          <h3 className="text-xl font-bold text-red-600 mb-3">📜 Rules:</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✅ Spin once per day for FREE!</li>
            <li>🎁 Win vouchers: 1%, 2%, 5%, or 10% OFF</li>
            <li>⏰ Vouchers expire at midnight today</li>
            <li>💼 Vouchers are auto-saved to your account</li>
            <li>🛒 Use them on any purchase today!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DailySpin;
