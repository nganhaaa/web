import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import './ChristmasTheme.css'

const CartTotal = ({ subtotal, discount = 0, appliedVoucher }) => {
  const { currency, delivery_fee, getCartAmount } = useContext(ShopContext);

  const deliveryFee = subtotal === 0 ? 0 : delivery_fee;
  const total = subtotal + deliveryFee - discount;

  return (
    <div className="w-full christmas-cart-total">
      <div className="text-2xl">
        <Title text1={'CART'} text2={'TOTALS'} />
      </div>

      <div className="flex flex-col gap-2 mt-2 text-sm">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>
            {currency} {subtotal.toFixed(2)}
          </p>
        </div>
        <hr className='border-gold-300'/>
        <div className="flex justify-between">
          <p>Shipping Fee</p>
          <p>
            {currency} {deliveryFee.toFixed(2)}
          </p>
        </div>
        <hr className='border-gold-300'/>
        {discount > 0 && (
          <>
            <div className="flex justify-between text-green-600 font-semibold">
              <p>Discount ({appliedVoucher?.code})</p>
              <p>
                - {currency} {discount.toFixed(2)}
              </p>
            </div>
            <hr className='border-gold-300'/>
          </>
        )}
        <div className='flex justify-between text-lg'>
          <b className='text-red-700'>Total</b>
          <b className='text-red-700'>{currency} {total.toFixed(2)}</b>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;
