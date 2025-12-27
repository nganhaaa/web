import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom';
import './ChristmasTheme.css'

const ProductItem = ({id, image, name, price}) => {

  const {currency} = useContext(ShopContext);

  return (
    <Link className='christmas-product-item block cursor-pointer' to={`/product/${id}`}>
        <div className='overflow-hidden rounded-xl'>
          <div className='overflow-hidden aspect-square bg-white'>
            <img className='w-full h-full object-cover hover:scale-110 transition-transform duration-500 ease-out' src={image[0]} alt={name} />
          </div>
          <div className='p-4 bg-white'>
            <p className='text-gray-800 font-medium mb-2 line-clamp-2'>{name}</p>
            <p className='text-lg font-bold text-red-600'>{currency}{price}</p>
          </div>
        </div>
    </Link>
  )
}

export default ProductItem