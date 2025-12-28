import { Routes, Route, useLocation } from 'react-router-dom' // 1. Import useLocation
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Collection from './pages/Collection'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Order from './pages/Order'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Favourite from './pages/Favourite'
import Reviews from './pages/Reviews'
import ChatBox from './components/chat'
import SearchBar from './components/SearchBar'
import ChristmasEffects from './components/ChristmasEffects'
import Vouchers from './pages/Vouchers'
import Livestream from './pages/Livestream'

const App = () => {
  // 2. Lấy vị trí (URL) hiện tại
  const location = useLocation();
  // 3. Kiểm tra xem có phải trang login không
  const isLoginPage = location.pathname === '/login';

  // 4. Tạo class động: nếu là trang login thì không có padding, ngược lại thì có
  const mainContentClass = isLoginPage 
    ? 'flex-grow' 
    : 'flex-grow px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]';

  return (
    <div className='flex flex-col min-h-screen'>
      <ChristmasEffects />
      <ToastContainer />
      {/* Navbar full width - no padding */}
      <Navbar />
      
      {/* 5. Sử dụng class đã tạo */}
      <div className={mainContentClass}>
        {/* Chỉ hiển thị SearchBar nếu không phải trang Login */}
        {!isLoginPage && <SearchBar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/vouchers" element={<Vouchers />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<Order />} />
          <Route path="/login" element={<Login />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/favourite" element={<Favourite />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/livestream" element={<Livestream />} />
        </Routes>
        <ChatBox />
      </div>
      
      {/* Footer full width - no padding - always at bottom */}
      <Footer />
    </div>
  )
}

export default App
