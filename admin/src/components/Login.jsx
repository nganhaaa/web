import axios from 'axios';
import React, { useState } from 'react'
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';

const Login = ({setToken}) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const res = await axios.post(backendUrl + '/api/users/admin', {email,password})
      if(res.data.success) {
        setToken(res.data.token)
      } else {
        toast.error(res.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // Google Login Handler for Admin
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log('🔍 Google credential received, sending to backend...');
      
      if (!credentialResponse.credential) {
        toast.error('Không nhận được credential từ Google');
        return;
      }
      
      const response = await axios.post(backendUrl + '/api/users/google-login-admin', {
        credential: credentialResponse.credential
      });
      
      if (response.data.success) {
        setToken(response.data.token);
        toast.success('Đăng nhập Google thành công!');
      } else {
        toast.error(response.data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('❌ Google Login Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi đăng nhập Google';
      toast.error(errorMessage);
    }
  };

  const handleGoogleError = (error) => {
    console.error('❌ Google OAuth Error:', error);
    if (error?.error === 'popup_closed_by_user') {
      toast.error('Bạn đã đóng cửa sổ đăng nhập');
    } else if (error?.error === 'access_denied') {
      toast.error('Bạn đã từ chối quyền truy cập');
    } else if (error?.error === 'popup_blocked') {
      toast.error('Cửa sổ popup bị chặn. Vui lòng cho phép popup cho trang web này');
    } else {
      toast.error('Lỗi đăng nhập Google: ' + (error?.error || 'Unknown error'));
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center w-full'>
      <div className='bg-white shadow-md rounded-lg px-8 py-6 max-w-md'>
        <h1 className='text-2xl font-bold mb-4'>Admin panel</h1>
        <form onSubmit={handleSubmit}>
          <div className='mb-3 min-w-72'>
            <label className='text-sm font-medium text-gray-700 mb-2'>Email</label>
            <input onChange={(e)=>setEmail(e.target.value)} className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' type="email" placeholder="email" required/>
          </div>
          <div className='mb-3 min-w-72'>
            <label className='text-sm font-medium text-gray-700 mb-2'>Password</label>
            <input onChange={(e)=>setPassword(e.target.value)} className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' type="password" placeholder="password" required/>
          </div>
          <button className='mt-2 w-full py-2 px-4 rounded-md text-white bg-black' type="submit">Login</button>
        </form>
        
        {/* Divider */}
        <div className='flex items-center my-4'>
          <div className='flex-1 border-t border-gray-300'></div>
          <span className='px-3 text-gray-500 text-sm'>OR</span>
          <div className='flex-1 border-t border-gray-300'></div>
        </div>
        
        {/* Google Login Button */}
        <div className='flex justify-center min-w-72'>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
          />
        </div>
      </div>
    </div>
  )
}

export default Login