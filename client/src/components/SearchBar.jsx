import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import { useLocation } from 'react-router-dom';

const SearchBar = () => {

    const { search, setSearch, showSearch, setShowSearch } = useContext(ShopContext);
    const [visible, setVisible] = useState(false)
    const location = useLocation();

    useEffect(() => {
        if (location.pathname.includes('collection')) {
            setVisible(true);
        }
        else {
            setVisible(false)
        }
    }, [location])

    return showSearch && visible ? (
        <div className='text-center py-5'>
            <div className='inline-flex items-center justify-center px-5 py-2 mx-3 rounded-lg w-3/4 sm:w-1/2' style={{border: '2px solid #ffd700', background: 'white'}}>
                <input value={search} onChange={(e) => setSearch(e.target.value)} className='flex-1 outline-none bg-inherit text-sm' type="text" placeholder='Search' style={{color: '#333'}} />
                <img className='w-4' src={assets.search_icon} alt="" />
            </div>
            <img onClick={() => setShowSearch(false)} className='inline w-3 cursor-pointer ml-3' src={assets.cross_icon} alt="" />
        </div>
    ) : null
}

export default SearchBar
