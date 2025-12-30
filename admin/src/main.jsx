
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

// Debug: Log Google Client ID (chỉ hiển thị 10 ký tự đầu để bảo mật)
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID') {
    console.log('✅ Google Client ID loaded:', GOOGLE_CLIENT_ID.substring(0, 20) + '...');
} else {
    console.error('❌ Google Client ID chưa được cấu hình!');
    console.error('Vui lòng kiểm tra file admin/.env có chứa:');
    console.error('VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here');
    console.error('Sau đó khởi động lại dev server (Ctrl+C rồi npm run dev)');
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </BrowserRouter>
)
