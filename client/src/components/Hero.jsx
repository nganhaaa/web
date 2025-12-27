import { assets } from '../assets/assets'
import './ChristmasHero.css'

const Hero = () => {
  return (
    <div className='christmas-hero flex flex-col sm:flex-row'>
      {/* left side */}
      <div className='flex w-full sm:w-1/2 items-center justify-center py-10 sm:py-0'>
        <div className='christmas-hero-text text-[#414141] px-6'>
          <div className='flex items-center gap-2'>
            <p className='christmas-hero-line w-8 sm:w-11 h-[3px]'></p>
            <p className='christmas-hero-subtitle font-medium text-sm md:text-base'>🎁 FESTIVE COLLECTION</p>
          </div>
          <h1 className='christmas-hero-title prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed' style={{color: '#c41e3a'}}>Holiday Special ✨</h1>
          <div className='flex items-center gap-2 cursor-pointer group'>
            <p className='christmas-hero-cta font-semibold text-sm md:text-base'>SHOP NOW 🎄</p>
            <p className='christmas-hero-line w-8 sm:w-11 h-[2px] group-hover:w-16 transition-all'></p>
          </div>
        </div>
      </div>
      {/* right side */}
      <img className='christmas-hero-image w-full sm:w-1/2 object-cover' src={assets.hero_img} alt="" />
    </div>
  )
}

export default Hero