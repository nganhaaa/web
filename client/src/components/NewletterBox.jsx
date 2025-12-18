import React from 'react'
import './ChristmasTheme.css'

const NewletterBox = () => {

  const onSubmitHandler = (event) => {
    event.preventDefault();
  }

  return (
    <div className='christmas-newsletter text-center py-16 px-8 my-10'>
      <p className='font-bold text-3xl text-white mb-3'>🎁 Subscribe now & get 20% off 🎄</p>
      <p className='mt-3 text-white opacity-90'>Join our festive newsletter for exclusive Christmas deals and updates!</p>
      <form onSubmit={onSubmitHandler} className='w-full sm:w-1/2 flex flex-col sm:flex-row items-center gap-3 mx-auto my-6' >
        <input type="email" placeholder="Enter your email" className='christmas-newsletter-input w-full sm:flex-1' required />
        <button type="submit" className='christmas-newsletter-btn w-full sm:w-auto'>SUBSCRIBE ✨</button>
      </form>
    </div>
  )
}

export default NewletterBox