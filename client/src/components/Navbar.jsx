import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import './ChristmasNavbar.css';

const Navbar = () => {
  const [visible, setVisible] = useState(false);

  const { setShowSearch, getCartCount, navigate, token, setToken, setCartItems, setFavouriteItems, getFavouriteCount, setUserId } = useContext(ShopContext);

  const logout = () => {
    navigate('/login');
    localStorage.removeItem('token');
    setToken('');
    setUserId('');
    setCartItems({});
    setFavouriteItems({});
  };

  return (
    <div className="christmas-navbar flex items-center justify-between py-5 font-medium">
      <Link to="/" style={{ zIndex: 10, position: 'relative' }}>
        <img src={assets.logo} className="w-36 brightness-0 invert" alt="" />
      </Link>

      <ul className="hidden sm:flex gap-8 text-sm items-center" style={{ zIndex: 10, position: 'relative' }}>
        <NavLink to="/" className="christmas-nav-link">
          <p>HOME</p>
        </NavLink>
        <NavLink to="/collection" className="christmas-nav-link">
          <p>COLLECTION</p>
        </NavLink>
        <NavLink to="/about" className="christmas-nav-link">
          <p>ABOUT</p>
        </NavLink>
        <NavLink to="/contact" className="christmas-nav-link">
          <p>CONTACT</p>
        </NavLink>
        <NavLink to="/livestream" className="christmas-nav-link">
          <p>LIVESTREAM</p>
        </NavLink>
      </ul>

      <div className="flex items-center gap-5" style={{ zIndex: 10, position: 'relative' }}>
        <img
          onClick={() => {
            setShowSearch(true);
            navigate('/collection');
          }}
          src={assets.search_icon}
          className="christmas-icon w-5 h-5 cursor-pointer"
          alt=""
        />

        <div className="group relative">
          <img
            onClick={() => (token ? null : navigate('/login'))}
            className="christmas-icon w-5 h-5 cursor-pointer"
            src={assets.profile_icon}
            alt=""
          />
          {/* Dropdown Menu */}
          {token && (
            <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4">
              <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-white text-gray-700 rounded shadow-lg border-2 border-christmas-red">
                <p onClick={() => navigate('/order')} className="cursor-pointer hover:text-christmas-red font-semibold">
                  Orders
                </p>
                <p onClick={() => navigate('/reviews')} className="cursor-pointer hover:text-christmas-red font-semibold">
                  Reviews
                </p>
                <p onClick={logout} className="cursor-pointer hover:text-christmas-red font-semibold">
                  Logout
                </p>
              </div>
            </div>
          )}
        </div>
        <Link to={token ? "/cart" : "/login"} className="relative">
          <img src={assets.cart_icon} className="christmas-icon w-5 h-5 min-w-5" alt="" />
          {token && <p className="christmas-cart-badge absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 aspect-square rounded-full text-[8px]">
            {getCartCount()}
          </p>}
        </Link>
        <Link to={token ? "/favourite" : "/login"} className="relative">
          <img src={assets.favoriteIcon} className="christmas-icon w-5 h-5 object-contain" alt="" />
          {token && <p className="christmas-cart-badge absolute right-[-2px] bottom-[-3px] w-4 text-center leading-4 aspect-square rounded-full text-[8px]">
            {getFavouriteCount()}
          </p>}
        </Link>
        <img onClick={() => setVisible(true)} src={assets.menu_icon} className="christmas-icon w-5 h-5 cursor-pointer sm:hidden" alt="" />
      </div>

      {/* Sidebar menu for small screens */}
      <div
        className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-gradient-to-b from-christmas-red to-christmas-dark-red transition-all ${visible ? 'w-full' : 'w-0'
          }`}
      >
        <div className="flex flex-col text-white">
          <div onClick={() => setVisible(false)} className="flex items-center gap-4 p-3 cursor-pointer hover:bg-white hover:text-christmas-red">
            <img className="h-4 rotate-180 brightness-0 invert" src={assets.dropdown_icon} alt="" />
            <p className="font-semibold">Back</p>
          </div>
          <NavLink onClick={() => setVisible(false)} className="py-2 pl-6 border border-christmas-gold hover:bg-christmas-gold hover:text-christmas-red font-semibold" to="/">
            Home
          </NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-2 pl-6 border border-christmas-gold hover:bg-christmas-gold hover:text-christmas-red font-semibold" to="/about">
            About
          </NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-2 pl-6 border border-christmas-gold hover:bg-christmas-gold hover:text-christmas-red font-semibold" to="/collection">
            Gifts
          </NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-2 pl-6 border border-christmas-gold hover:bg-christmas-gold hover:text-christmas-red font-semibold" to="/contact">
            Share
          </NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-2 pl-6 border border-christmas-gold hover:bg-christmas-gold hover:text-christmas-red font-semibold" to="/contact">
            Contact
          </NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-2 pl-6 border border-christmas-gold hover:bg-christmas-gold hover:text-christmas-red font-semibold" to="/livestream">
            Livestream
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
