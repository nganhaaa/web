import './ChristmasTheme.css'

const Title = ({text1, text2}) => {
  return (
    <div className='inline-flex gap-2 items-center mb-3'>
      <p className='christmas-title text-gray-500 '>{text1} <span className='text-gray-700 font-medium' >{text2}</span></p>
      <p className='w-8 sm:w-12 h-[1px] sm:h-[2px]' style={{background: 'linear-gradient(90deg, #c41e3a 0%, #ffd700 100%)'}}></p>
    </div>
  )
}

export default Title