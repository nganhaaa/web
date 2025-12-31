import { useContext, useState } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../components/ChristmasTheme.css';

const PlaceOrder = () => {
  const [method, setMethod] = useState('cod');
  const [phoneError, setPhoneError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products, appliedVoucher } =
    useContext(ShopContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
  });

  const validatePhone = (phone) => {
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    return phoneRegex.test(phone);
  };

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    
    if (name === 'phone') {
      setPhoneError('');
      if (value && !validatePhone(value)) {
        setPhoneError('Invalid phone number');
      }
    }
    
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    if (!validatePhone(formData.phone)) {
      setPhoneError('Invalid phone number');
      return;
    }
    
    setIsLoading(true);
    
    try {
      let orderItems = [];

      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(products.find((product) => product._id === items));
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            }
          }
        }
      }

      const discount = appliedVoucher ? appliedVoucher.discount : 0;
      const voucherId = appliedVoucher ? appliedVoucher._id : null;

      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
        discount: discount,
        voucherId: voucherId
      };

      switch (method) {
        // API Calls for COD
        case 'cod': {
          const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } });
          if (response.data.success) {
            setCartItems({});
            navigate('/order');
          } else {
            toast.error(response.data.message);
          }
          break;
        }

        case 'momo': {
          toast.info('Đang kết nối với MoMo...');
          const responseMomo = await axios.post(backendUrl + '/api/order/place/momo', orderData, { headers: { token } });
          if (responseMomo.data.success) {
            const { payUrl } = responseMomo.data;
            toast.success('Chuyển đến trang thanh toán MoMo...');
            window.location.replace(payUrl);
          } else {
            console.log(responseMomo.data.message)
            toast.error(responseMomo.data.message);
            setIsLoading(false);
          }
          break;
        }

        default:
          break;
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
    {/* Background image with overlay */}
    <div 
      className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
      style={{
        backgroundImage: "url('/christmas9.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-white/85"></div>
    </div>
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-10 pt-5 sm:pt-14 min-h-[80vh] border-t"
    >
      {/* ------------- Left Side ---------------- */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[600px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={'DELIVERY'} text2={'INFORMATION 📦'} />
        </div>
        <div className="bg-white rounded-lg p-6 border-2 border-gold-300 shadow-lg">
          <div className="flex gap-3 mb-4">
            <input
              required
              onChange={onChangeHandler}
              name="name"
              value={formData.name}
              className="christmas-input w-full"
              type="text"
              placeholder="Full Name"
            />
          </div>
          <input
            required
            onChange={onChangeHandler}
            name="email"
            value={formData.email}
            className="christmas-input w-full mb-4"
            type="email"
            placeholder="Email Address"
          />
          <input
            required
            onChange={onChangeHandler}
            name="address"
            value={formData.address}
            className="christmas-input w-full mb-4"
            type="text"
            placeholder="Delivery Address"
          />
        
          <div>
            <input
              required
              onChange={onChangeHandler}
              name="phone"
              value={formData.phone}
              className={`christmas-input w-full ${phoneError ? 'border-red-500' : ''}`}
              type="number"
              placeholder="Phone Number"
            />
            {phoneError && <p className="text-red-500 text-sm mt-1">❌ {phoneError}</p>}
          </div>
        </div>
      </div>

      {/* ------------- Right Side ------------------ */}
      <div className="mt-8">
        <div className="mt-8 min-w-90">
          <CartTotal 
            subtotal={getCartAmount()}
            discount={appliedVoucher ? appliedVoucher.discount : 0}
            appliedVoucher={appliedVoucher}
          />
        </div>

        <div className="mt-12">
          <Title text1={'PAYMENT'} text2={'METHOD 💳'} />
          {/* --------------- Payment Method Selection ------------- */}
          <div className="flex gap-3 flex-col lg:flex-row">
            <div onClick={() => setMethod('momo')} className={`flex items-center gap-3 border-2 p-2 px-3 cursor-pointer rounded-lg transition ${method === 'momo' ? 'border-red-600 bg-red-50' : 'border-gold-400'}`}>
              <p className={`min-w-3.5 h-3.5 border-2 rounded-full ${method === 'momo' ? 'bg-red-600 border-red-600' : 'border-gray-400'}`}></p>
              <img className="h-10 mx-4" src={assets.momo_payment2} alt="" />
            </div>
            <div onClick={() => setMethod('cod')} className={`flex items-center gap-3 border-2 p-5 sm:p-2 px-3 cursor-pointer rounded-lg transition ${method === 'cod' ? 'border-red-600 bg-red-50' : 'border-gold-400'}`}>
              <p className={`min-w-3.5 h-3.5 border-2 rounded-full ${method === 'cod' ? 'bg-red-600 border-red-600' : 'border-gray-400'}`}></p>
              <p className="text-gray-700 text-sm font-medium mx-5">💵 CASH ON DELIVERY</p>
            </div>
          </div>

          <div className="w-full text-end mt-8">
            <button 
              type="submit" 
              disabled={isLoading}
              className={`christmas-btn-primary w-full sm:w-auto px-16 py-3 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  PROCESSING...
                </span>
              ) : (
                'PLACE ORDER'
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
    </div>
  );
};

export default PlaceOrder;
