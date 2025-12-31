import { assets } from '../assets/assets'
import './ChristmasTheme.css'

const Footer = () => {
  return (
    <footer className='christmas-footer py-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 text-sm'>
        <div>
          <img src={assets.logo} className='mb-5 w-32 brightness-0 invert' alt="" />
          <p className='w-full md:w-2/3 text-white opacity-80'>
          Your one-stop shop for all festive fashion needs. Delivering joy and style this Christmas season!
          </p>
        </div>

        <div>
          <p className='christmas-footer-title text-xl mb-5'>COMPANY</p>
          <ul className='flex flex-col gap-2 text-white opacity-80'>
            <li className='hover:opacity-100 cursor-pointer'>🏠 Home</li>
            <li className='hover:opacity-100 cursor-pointer'>ℹ️ About us</li>
            <li className='hover:opacity-100 cursor-pointer'>🚚 Delivery</li>
            <li className='hover:opacity-100 cursor-pointer'>🔒 Privacy policy</li>
          </ul>
        </div>

        <div>
          <p className='christmas-footer-title text-xl mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-2 text-white opacity-80'>
            <li className='hover:opacity-100'>📞 +1-000-000-0000</li>
            <li className='hover:opacity-100'>✉️ contact@gmail.com</li>
            <li className='hover:opacity-100 cursor-pointer'>📸 Instagram</li>
          </ul>
        </div>

      </div>

      <div>
        <hr className='border-gold-500'/>
        <p className='text-center py-5 text-sm text-white opacity-80'>Copyright 2025 - All Right Reserved. Happy Holidays!</p>
      </div>
    </footer>
  )
}

export default Footer