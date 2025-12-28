import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewletterBox'

const About = () => {
  return (
    <div className="relative">
      {/* Background image with overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: "url('/christmas2.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-white/85"></div>
      </div>

      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-800'>
          <p className='font-medium'>Forever was born out of a passion for innovation and a desire to revolutionize the way people shop online. Our journey began with a simple idea: to provide a platform where customers can easily discover, explore, and purchase a wide range of products from the comfort of their homes.</p>
          <p className='font-medium'>Since our inception, we've worked tirelessly to curate a diverse selection of high-quality products that cater to every taste and preference. From fashion and beauty to electronics and home essentials, we offer an extensive collection sourced from trusted brands and suppliers.</p>
          <b className='text-gray-900 text-lg'>Our Mission</b>
          <p className='font-medium'>Our mission at Forever is to empower customers with choice, convenience, and confidence. We're dedicated to providing a seamless shopping experience that exceeds expectations, from browsing and ordering to delivery and beyond.</p>
        </div>
      </div>

      <div className=' text-xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20 gap-4'>
        <div className='bg-white/90 backdrop-blur-sm border-2 border-gray-300 rounded-lg px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5 shadow-lg'>
          <b className='text-base'>Quality Assurance:</b>
          <p className='text-gray-700 font-medium'>We meticulously select and vet each product to ensure it meets our stringent quality standards.</p>
        </div>
        <div className='bg-white/90 backdrop-blur-sm border-2 border-gray-300 rounded-lg px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5 shadow-lg'>
          <b className='text-base'>Convenience:</b>
          <p className='text-gray-700 font-medium'>With our user-friendly interface and hassle-free ordering process, shopping has never been easier.</p>
        </div>
        <div className='bg-white/90 backdrop-blur-sm border-2 border-gray-300 rounded-lg px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5 shadow-lg'>
          <b className='text-base'>Exceptional Customer Service:</b>
          <p className='text-gray-700 font-medium'>Our team of dedicated professionals is here to assist you the way, ensuring your satisfaction is our top priority.</p>
        </div>
      </div>

      <NewsletterBox />

    </div>
  )
}

export default About
