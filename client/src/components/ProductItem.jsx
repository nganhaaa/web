import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom';
import './ChristmasTheme.css'

const ProductItem = ({id, image, name, price}) => {

  const {currency} = useContext(ShopContext);

  return (
    <Link className='christmas-product-item block cursor-pointer group' to={`/product/${id}`}>
        <div className='bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2'>
          <div className='overflow-hidden aspect-square bg-gray-50'>
            <img className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out' src={image[0]} alt={name} />
          </div>
          <div className='p-4'>
            <p className='text-gray-800 font-medium mb-2 line-clamp-2 group-hover:text-red-600 transition-colors'>{name}</p>
            <p className='text-lg font-bold text-red-600'>{currency}{price}</p>
          </div>
        </div>
    </Link>
  )
}

export default ProductItem