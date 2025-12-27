import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import './ChristmasTheme.css'

const CartTotal = () => {

    const {currency,delivery_fee,getCartAmount} = useContext(ShopContext);

  return (
    <div className='w-full christmas-cart-total'>
      <div className='text-2xl'>
        <Title text1={'CART'} text2={'TOTALS'} />
      </div>

      <div className='flex flex-col gap-2 mt-4 text-sm'>
            <div className='flex justify-between'>
                <p>Subtotal</p>
                <p className='font-semibold'>{currency} {getCartAmount()}.00</p>
            </div>
            <hr className='border-gold-300'/>
            <div className='flex justify-between'>
                <p>Shipping Fee</p>
                <p className='font-semibold'>{currency} {delivery_fee}.00</p>
            </div>
            <hr className='border-gold-300'/>
            <div className='flex justify-between text-lg'>
                <b className='text-red-700'>Total</b>
                <b className='text-red-700'>{currency} {getCartAmount() === 0 ? 0 : getCartAmount() + delivery_fee}.00</b>
            </div>
      </div>
    </div>
  )
}

export default CartTotal
