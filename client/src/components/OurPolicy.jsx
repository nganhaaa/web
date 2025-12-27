import React from 'react'
import { assets } from '../assets/assets'
import './ChristmasTheme.css'

const OurPolicy = () => {
  return (
    <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap-6 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700'>
        <div className='christmas-policy-item'>
          <img src={assets.exchange_icon} className='w-12 m-auto mb-5' alt="" />
          <p className='font-semibold text-red-700'>Easy Exchange Policy</p>
          <p className='text-gray-500'>We offer hassle free exchange policy</p>
        </div>
        <div className='christmas-policy-item'>
          <img src={assets.quality_icon} className='w-12 m-auto mb-5' alt="" />
          <p className='font-semibold text-red-700'>7 Days Return Policy</p>
          <p className='text-gray-500'>We provide 7 days free return policy</p>
        </div>
        <div className='christmas-policy-item'>
          <img src={assets.support_img} className='w-12 m-auto mb-5' alt="" />
          <p className='font-semibold text-red-700'>Best customer support</p>
          <p className='text-gray-500'>We provide 24/7 customer support</p>
        </div>
    </div>
  )
}

export default OurPolicy