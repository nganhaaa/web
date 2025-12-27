import './ChristmasTheme.css'

const Title = ({text1, text2}) => {
  return (
    <div className='inline-flex gap-2 items-center mb-3'>
      <p className='w-8 sm:w-12 h-[1px] sm:h-[2px]' style={{background: 'linear-gradient(90deg, #c41e3a 0%, #ffd700 100%)'}}></p>
      <p className='christmas-title' style={{color: '#8b0000', fontWeight: 500}}>{text1} <span style={{color: '#c41e3a', fontWeight: 500}} >{text2}</span></p>
      <p className='w-8 sm:w-12 h-[1px] sm:h-[2px]' style={{background: 'linear-gradient(90deg, #c41e3a 0%, #ffd700 100%)'}}></p>
    </div>
  )
}

export default Title