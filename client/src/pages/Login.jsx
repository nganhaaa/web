import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, navigate, backendUrl, setUserId } = useContext(ShopContext);

  const [name, setName] = useState('');
  const [password, setPasword] = useState('');
  const [email, setEmail] = useState('');

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currentState === 'Sign Up') {
        const response = await axios.post(backendUrl + '/api/users/register', { name, email, password });
        if (response.data.success) {
          setToken(response.data.token);
          setUserId(response.data.userId);
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userId', response.data.userId);
          localStorage.setItem('username', name); // Save username for comment
          localStorage.setItem('user', JSON.stringify({ name, email }));
          console.log(response.data)

        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(backendUrl + '/api/users/login', { email, password });
        if (response.data.success) {
          setToken(response.data.token);
          setUserId(response.data.userId);
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userId', response.data.userId);
          if (response.data.name) {
            localStorage.setItem('username', response.data.name);
            localStorage.setItem('user', JSON.stringify({ name: response.data.name, email }));
          }

        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token]);

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/christmas-login-bg.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="w-full h-full py-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center h-full px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
          {/* Left side - Welcome section */}
          <div className="hidden md:block text-white">
            <div className="bg-christmas-red/90 rounded-2xl p-12 shadow-2xl">
              <h1 className="text-5xl font-bold mb-6">
                {currentState === 'Login' ? 'Welcome Back!' : 'Join Our Family!'}
              </h1>
              <p className="text-xl mb-8 text-white/90">
                {currentState === 'Login' 
                  ? 'Continue your festive shopping journey with us. Great deals await!' 
                  : 'Create an account and unlock exclusive holiday offers and rewards!'}
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-lg">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                  <span>Exclusive member benefits</span>
                </div>
                <div className="flex items-center gap-3 text-lg">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                  <span>Fast & secure checkout</span>
                </div>
                <div className="flex items-center gap-3 text-lg">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                  <span>Track your orders easily</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-christmas-red mb-2">
                  {currentState === 'Login' ? 'Sign In' : 'Create Account'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {currentState === 'Login' 
                    ? 'Enter your credentials to access your account' 
                    : 'Fill in your details to get started'}
                </p>
              </div>

              <form onSubmit={onSubmitHandler} className="space-y-6">
                {currentState === 'Sign Up' && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      id="name"
                      onChange={(e) => setName(e.target.value)}
                      value={name}
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-christmas-red focus:ring-2 focus:ring-christmas-red/20 transition-all outline-none text-lg"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    type="email"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-christmas-red focus:ring-2 focus:ring-christmas-red/20 transition-all outline-none text-lg"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    onChange={(e) => setPasword(e.target.value)}
                    value={password}
                    type="password"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-christmas-red focus:ring-2 focus:ring-christmas-red/20 transition-all outline-none text-lg"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {currentState === 'Login' && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-christmas-red focus:ring-christmas-red w-4 h-4" />
                      <span className="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>
                    <button type="button" className="text-sm text-christmas-red hover:text-christmas-green transition-colors font-semibold">
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-christmas-red to-christmas-red/90 text-white py-4 rounded-lg font-bold text-lg hover:from-christmas-red/90 hover:to-christmas-red transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl"
                >
                  {currentState === 'Login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              {/* Toggle between Login/Signup */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  {currentState === 'Login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => setCurrentState(currentState === 'Login' ? 'Sign Up' : 'Login')}
                    className="text-christmas-red font-bold hover:text-christmas-green transition-colors underline"
                  >
                    {currentState === 'Login' ? 'Sign Up Now' : 'Sign In'}
                  </button>
                </p>
              </div>

              {/* Mobile festive message */}
              <div className="mt-6 text-center text-sm text-gray-600 md:hidden">
                <p>Happy Shopping & Merry Christmas!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
