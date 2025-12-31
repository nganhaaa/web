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
    <div className="christmas-navbar flex items-center justify-between py-3 sm:py-5 font-medium">
      <Link to="/" style={{ zIndex: 10, position: 'relative' }}>
        <span className="text-xl sm:text-3xl font-bold text-white" style={{ letterSpacing: '0.1em' }}>SHOPWEB</span>
      </Link>

      <ul className="hidden sm:flex gap-8 text-sm items-center" style={{ zIndex: 10, position: 'relative' }}>
        <NavLink to="/" className="christmas-nav-link">
          <p>HOME</p>
        </NavLink>
        <NavLink to="/collection" className="christmas-nav-link">
          <p>COLLECTION</p>
        </NavLink>
        <NavLink to="/vouchers" className="christmas-nav-link">
          <p>VOUCHERS</p>
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

      <div className="flex items-center gap-3 sm:gap-5" style={{ zIndex: 10, position: 'relative' }}>
        <img
          onClick={() => {
            setShowSearch(true);
            navigate('/collection');
          }}
          src={assets.search_icon}
          className="christmas-icon w-5 h-5 sm:w-6 sm:h-6 cursor-pointer"
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

      {/* Overlay backdrop for mobile menu */}
      {visible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 sm:hidden"
          style={{ zIndex: 999 }}
          onClick={() => setVisible(false)}
        />
      )}

      {/* Sidebar menu for small screens */}
      <div
        className={`fixed top-0 right-0 bottom-0 overflow-hidden bg-gradient-to-b from-christmas-red to-christmas-dark-red transition-all shadow-2xl ${visible ? 'w-[75%] sm:w-[60%]' : 'w-0'
          }`}
        style={{ zIndex: 1000 }}
      >
        <div className="flex flex-col text-white h-full">
          <div onClick={() => setVisible(false)} className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white hover:text-christmas-red border-b border-christmas-gold">
            <img className="h-5 rotate-180 brightness-0 invert" src={assets.dropdown_icon} alt="" />
            <p className="font-bold text-lg">Back</p>
          </div>
          <NavLink onClick={() => setVisible(false)} className="py-3 pl-6 border-b border-christmas-gold hover:bg-christmas-gold hover:text-christmas-red font-semibold text-base" to="/">
            🏠 Home
          </NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-3 pl-6 border-b border-christmas-gold hover:bg-christmas-gold hover:text-christmas-red font-semibold text-base" to="/collection">
            🎁 Collection
          </NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-3 pl-6 border-b border-christmas-gold hover:bg-christmas-gold hover:text-christmas-red font-semibold text-base" to="/vouchers">
            🎟️ Vouchers
          </NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-3 pl-6 border-b border-christmas-gold hover:bg-christmas-gold hover:text-christmas-red font-semibold text-base" to="/about">
            ℹ️ About
          </NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-3 pl-6 border-b border-christmas-gold hover:bg-christmas-gold hover:text-christmas-red font-semibold text-base" to="/contact">
            📞 Contact
          </NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-3 pl-6 border-b border-christmas-gold hover:bg-christmas-gold hover:text-christmas-red font-semibold text-base" to="/livestream">
            📺 Livestream
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
