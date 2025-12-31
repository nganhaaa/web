import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';
import '../components/ChristmasTheme.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate, appliedVoucher, setAppliedVoucher, backendUrl, token } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [showSavedVouchers, setShowSavedVouchers] = useState(false);
  const [savedVouchers, setSavedVouchers] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const productData = products.find((product) => product._id === items);
            if (productData) {
              tempData.push({
                _id: items,
                size: item,
                quantity: cartItems[items][item],
                price: productData.price,
                name: productData.name,
                image: productData.image,
                category: productData.category
              });
            }
          }
        }
      }
      setCartData(tempData.reverse());
    }
  }, [cartItems, products]);

  useEffect(() => {
    if (token) {
      fetchSavedVouchers();
    }
  }, [token]);

  const fetchSavedVouchers = async () => {
    if (!token) return;
    try {
      const response = await axios.post(
        backendUrl + '/api/voucher/user',
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setSavedVouchers(response.data.active);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    cartData.forEach((item) => {
      totalAmount += item.price * item.quantity;
    });
    return totalAmount;
  };

  const getCartCategories = () => {
    const categories = new Set();
    cartData.forEach((item) => {
      if (item.category) {
        categories.add(item.category);
      }
    });
    return Array.from(categories);
  };

  const applyVoucherByCode = async (code) => {
    if (!code.trim()) {
      setVoucherError('Please enter a voucher code');
      return;
    }

    setIsApplyingVoucher(true);
    setVoucherError('');

    try {
      const cartTotal = getCartAmount();
      const categories = getCartCategories();

      const response = await axios.post(backendUrl + '/api/voucher/validate', {
        code: code.toUpperCase(),
        cartTotal,
        categories
      });

      if (response.data.success) {
        setAppliedVoucher(response.data.voucher);
        toast.success(response.data.message);
        setVoucherCode('');
        setShowSavedVouchers(false);
      } else {
        setVoucherError(response.data.message);
        toast.error(response.data.message);
      }
    } catch (error) {
      setVoucherError('Failed to apply voucher');
      toast.error('Failed to apply voucher');
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const applyVoucher = () => {
    applyVoucherByCode(voucherCode);
  };

  const applySavedVoucher = (voucher) => {
    applyVoucherByCode(voucher.voucherId.code);
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setVoucherError('');
    toast.info('Voucher removed');
  };

  const getFinalTotal = () => {
    const subtotal = getCartAmount();
    const deliveryFee = subtotal === 0 ? 0 : 10;
    const discount = appliedVoucher ? appliedVoucher.discount : 0;
    return subtotal + deliveryFee - discount;
  };

  return (
    <div className="border-t pt-14 relative min-h-screen">
    {/* Background image with overlay */}
    <div 
      className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
      style={{
        backgroundImage: "url('/christmas7.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-white/85"></div>
    </div>
      <div className=" text-2xl mb-3">
        <Title text1={'YOUR'} text2={'CART 🛒'} />
      </div>
      {cartData.length == 0 && (
        <div className="flex justify-center mt-10">
          <p className="text-gray-500">Your cart is empty. Start shopping!</p>
        </div>
      )}
      <div>
        {cartData.map((item, index) => {
          const productData = products.find((product) => product._id === item._id);
          if (!productData) return null;

          return (
            <div
              key={index}
              className="py-4 px-4 my-3 bg-white rounded-lg border-2 border-gold-300 text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4 shadow-lg hover:shadow-xl hover:border-red-400 transition-all"
            >
              <div className=" flex items-start gap-6" style={{ cursor: "pointer" }} onClick={() => { window.location.pathname = `/product/${item._id}` }}>
                <img className="w-16 sm:w-20 rounded-lg border-2 border-gold-300" src={productData.image[0]} alt="" />
                <div>
                  <p className="text-xs sm:text-lg font-medium">{productData.name}</p>
                  <div className="flex items-center gap-5 mt-2">
                    <p className="font-semibold text-red-600">
                      {currency}
                      {productData.price}
                    </p>
                    <p className="px-2 sm:px-3 sm:py-1 border-2 border-gold-400 bg-yellow-50 rounded">{item.size}</p>
                  </div>
                </div>
              </div>
              <input
                onChange={(e) =>
                  e.target.value === '' || e.target.value === '0'
                    ? null
                    : updateQuantity(item._id, item.size, Number(e.target.value))
                }
                className="christmas-input max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
                type="number"
                min={1}
                defaultValue={item.quantity}
              />
              <div className="flex">
                <img
                  onClick={() => updateQuantity(item._id, item.size, 0)}
                  className="w-4 mr-4 sm:w-5 cursor-pointer hover:scale-110 transition"
                  src={assets.bin_icon}
                  alt=""
                  title="Remove item"
                />
              </div>
            </div>
          );
        })}
      </div>

      {cartData.length > 0 && (
        <div className="flex justify-end my-20">
          <div className="w-full sm:w-[450px]">
            <CartTotal 
              subtotal={getCartAmount()} 
              discount={appliedVoucher ? appliedVoucher.discount : 0}
              appliedVoucher={appliedVoucher}
            />
            <div className="mt-6 border-2 border-red-600 rounded-lg p-4 bg-red-50">
              <h3 className="text-lg font-bold text-red-600 mb-3">🎟️ Have a Voucher?</h3>
              
              {appliedVoucher ? (
                <div className="bg-white border-2 border-green-500 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-green-600 text-lg">{appliedVoucher.code}</p>
                      <p className="text-sm text-gray-600">{appliedVoucher.description}</p>
                      <p className="text-sm font-semibold text-green-600 mt-1">
                        Discount: {currency}{appliedVoucher.discount.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={removeVoucher}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      ❌ Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {token && savedVouchers.length > 0 && (
                    <div className="mb-3">
                      <button
                        onClick={() => setShowSavedVouchers(!showSavedVouchers)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline"
                      >
                        {showSavedVouchers ? '❌ Hide' : '📋 Use saved voucher'}
                      </button>
                      
                      {showSavedVouchers && (
                        <div className="mt-3 max-h-60 overflow-y-auto space-y-2">
                          {savedVouchers.map((uv) => (
                            <div
                              key={uv._id}
                              onClick={() => applySavedVoucher(uv)}
                              className="bg-white border-2 border-gold-400 rounded-lg p-3 cursor-pointer hover:bg-gold-50 transition"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-bold text-red-600">{uv.voucherId.code}</p>
                                  <p className="text-xs text-gray-600">{uv.voucherId.description}</p>
                                  <p className="text-xs text-green-600 mt-1">
                                    {uv.voucherId.discountType === 'percentage'
                                      ? `${uv.voucherId.discountValue}% OFF`
                                      : `${currency}${uv.voucherId.discountValue} OFF`}
                                  </p>
                                </div>
                                <span className="text-2xl">👉</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => {
                        setVoucherCode(e.target.value.toUpperCase());
                        setVoucherError('');
                      }}
                      placeholder="Enter voucher code"
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none uppercase"
                      disabled={isApplyingVoucher}
                    />
                    <button
                      onClick={applyVoucher}
                      disabled={isApplyingVoucher}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold"
                    >
                      {isApplyingVoucher ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                  {voucherError && (
                    <p className="text-red-600 text-sm mt-2">⚠️ {voucherError}</p>
                  )}
                </div>
              )}
            </div>
            <div className=" w-full text-end">
              <button onClick={() => navigate('/place-order')} className="christmas-btn-primary w-full sm:w-auto my-8">
                PROCEED TO CHECKOUT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
