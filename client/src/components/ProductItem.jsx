import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom';
import './ChristmasTheme.css'

const ProductItem = ({id, image, name, price}) => {

  const {currency} = useContext(ShopContext);

  return (
    <Link className='christmas-product-item text-gray-700 cursor-pointer p-3 block' to={`/product/${id}`}>
        <div className='overflow-hidden '>
          <img className='hover:scale-110 transition ease-in-out rounded-sm' src={image[0]} alt="" />
        </div>
          <p className='pt-3 pb-1 text-sm'>{name}</p>
          <p className='text-sm font-medium text-red-600'>{currency}{price}</p>
    </Link>
  )
}

export default ProductItem