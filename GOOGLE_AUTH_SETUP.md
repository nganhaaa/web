# Hướng dẫn Setup Google OAuth cho dự án

## 📋 Tổng quan

Dự án hiện đã được tích hợp Google OAuth 2.0 cho cả **Client** (người dùng) và **Admin**. Hướng dẫn này sẽ giúp bạn cấu hình Google OAuth credentials.

---

## 🔑 Bước 1: Tạo Google OAuth Credentials

### 1.1. Truy cập Google Cloud Console

1. Truy cập: [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Đăng nhập bằng tài khoản Google của bạn
3. Tạo project mới hoặc chọn project có sẵn

### 1.2. Kích hoạt Google+ API

1. Trong menu bên trái, chọn **"APIs & Services"** → **"Library"**
2. Tìm kiếm **"Google+ API"**
3. Click **"Enable"** để kích hoạt

### 1.3. Tạo OAuth 2.0 Client ID

1. Vào **"APIs & Services"** → **"Credentials"**
2. Click **"CREATE CREDENTIALS"** → chọn **"OAuth client ID"**
3. Nếu chưa cấu hình OAuth consent screen:
   - Click **"CONFIGURE CONSENT SCREEN"**
   - Chọn **"External"** (hoặc Internal nếu dùng Google Workspace)
   - Điền thông tin:
     - **App name**: Tên ứng dụng của bạn
     - **User support email**: Email hỗ trợ
     - **Developer contact email**: Email liên hệ
   - Click **"Save and Continue"**
   - Ở phần **Scopes**, thêm:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Click **"Save and Continue"**

4. Quay lại **"Credentials"**, click **"CREATE CREDENTIALS"** → **"OAuth client ID"**
5. Chọn **"Application type"**: **"Web application"**
6. Đặt tên cho Client ID (ví dụ: "My Web App OAuth")
7. Thêm **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:5174
   http://localhost:3000
   https://yourdomain.com
   ```
8. Thêm **Authorized redirect URIs** (không bắt buộc với Google One Tap):
   ```
   http://localhost:5173
   http://localhost:5174
   http://localhost:3000
   https://yourdomain.com
   ```
9. Click **"CREATE"**
10. **Lưu lại Client ID** (bạn sẽ cần nó cho bước tiếp theo)

---

## ⚙️ Bước 2: Cấu hình Environment Variables

### 2.1. Backend (Server)

Tạo/cập nhật file `.env` trong thư mục `server/`:

```env
# Existing variables...
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin_password
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

**⚠️ Quan trọng**: Thay `YOUR_GOOGLE_CLIENT_ID_HERE` bằng Client ID bạn vừa tạo ở bước 1.3.

### 2.2. Frontend Client

Tạo file `.env` trong thư mục `client/`:

```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

### 2.3. Frontend Admin

Tạo file `.env` trong thư mục `admin/`:

```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

**⚠️ Lưu ý**: Client ID phải giống nhau cho cả 3 file `.env`

---

## 📦 Bước 3: Cài đặt Dependencies

### 3.1. Server

```bash
cd server
npm install
```

Packages đã được thêm:
- `google-auth-library@^9.15.0`
- `passport@^0.7.0`
- `passport-google-oauth20@^2.0.0`
- `express-session@^1.18.1`

### 3.2. Client

```bash
cd client
npm install
```

Package đã được thêm:
- `@react-oauth/google@^0.12.1`

### 3.3. Admin

```bash
cd admin
npm install
```

Package đã được thêm:
- `@react-oauth/google@^0.12.1`

---

## 🚀 Bước 4: Chạy ứng dụng

### 4.1. Khởi động Server

```bash
cd server
npm start
# hoặc với nodemon:
npm run server
```

### 4.2. Khởi động Client

```bash
cd client
npm run dev
```

Client sẽ chạy tại: `http://localhost:5173`

### 4.3. Khởi động Admin

```bash
cd admin
npm run dev
```

Admin sẽ chạy tại: `http://localhost:5174`

---

## ✅ Bước 5: Kiểm tra chức năng

### 5.1. Kiểm tra Client Login

1. Truy cập: `http://localhost:5173/login`
2. Bạn sẽ thấy form đăng nhập với:
   - Email/Password login (cũ)
   - Nút **"Sign in with Google"** (mới)
3. Click nút Google login và chọn tài khoản Google
4. Sau khi đăng nhập thành công, bạn sẽ được chuyển đến trang chủ

### 5.2. Kiểm tra Admin Login

1. Truy cập: `http://localhost:5174`
2. Bạn sẽ thấy Admin login panel với:
   - Email/Password login (cũ)
   - Nút **"Sign in with Google"** (mới)
3. **Lưu ý**: Admin chỉ có thể đăng nhập Google nếu:
   - Email đã tồn tại trong database admin
   - Account admin phải active (`isActive: true`)

---

## 🔐 Cách hoạt động

### Client (User) Login Flow:

1. User click nút "Sign in with Google"
2. Google hiển thị popup chọn tài khoản
3. Sau khi chọn, Google trả về credential token
4. Frontend gửi token đến backend endpoint: `POST /api/users/google-login`
5. Backend verify token với Google
6. Backend tìm user theo email:
   - **Nếu tồn tại**: Cập nhật `googleId` và trả về token JWT
   - **Nếu chưa tồn tại**: Tạo user mới và trả về token JWT
7. Frontend lưu token và redirect đến trang chủ

### Admin Login Flow:

1. Admin click nút "Sign in with Google"
2. Google hiển thị popup chọn tài khoản
3. Sau khi chọn, Google trả về credential token
4. Frontend gửi token đến backend endpoint: `POST /api/users/google-login-admin`
5. Backend verify token với Google
6. Backend kiểm tra:
   - Email phải tồn tại trong `adminModel`
   - Account phải active (`isActive: true`)
7. Nếu hợp lệ, trả về token JWT
8. Frontend lưu token và vào admin panel

---

## 🗄️ Database Schema Updates

### User Model (`userModel.js`)

Đã thêm các field:
```javascript
{
  googleId: String,  // Google OAuth ID
  avatar: String,    // Profile picture from Google
  password: String   // Optional nếu dùng Google login
}
```

### Admin Model (`adminModel.js`)

Đã thêm field:
```javascript
{
  googleId: String,  // Google OAuth ID
  password: String   // Optional nếu dùng Google login
}
```

---

## 🐛 Troubleshooting

### Lỗi: "Google authentication failed"

**Nguyên nhân**: 
- Client ID không đúng
- Token expired

**Giải pháp**:
1. Kiểm tra lại `GOOGLE_CLIENT_ID` trong `.env`
2. Đảm bảo Client ID giống nhau ở cả 3 nơi (server, client, admin)
3. Restart lại server và frontend

### Lỗi: "No admin account found with this email"

**Nguyên nhân**: Email Google chưa được thêm vào database admin

**Giải pháp**:
1. Tạo admin account trước bằng email/password
2. Sau đó mới có thể dùng Google login với email đó

### Lỗi: "Missing environment variables: GOOGLE_CLIENT_ID"

**Nguyên nhân**: Chưa thêm `GOOGLE_CLIENT_ID` vào `.env`

**Giải pháp**:
1. Thêm `GOOGLE_CLIENT_ID` vào `server/.env`
2. Restart server

### Google button không hiển thị

**Nguyên nhân**: 
- Package chưa được cài đặt
- Client ID không được cấu hình

**Giải pháp**:
1. Chạy `npm install` trong thư mục `client/` và `admin/`
2. Kiểm tra file `.env` đã có `VITE_GOOGLE_CLIENT_ID`
3. Restart frontend

---

## 📝 Testing Checklist

- [ ] Server chạy thành công không có lỗi environment variables
- [ ] Client login page hiển thị nút Google login
- [ ] Admin login page hiển thị nút Google login
- [ ] Click Google login button mở popup Google
- [ ] Đăng nhập Google thành công tạo/cập nhật user trong database
- [ ] Token JWT được lưu vào localStorage
- [ ] Redirect về trang chủ sau khi login thành công
- [ ] Admin login chỉ chấp nhận email đã tồn tại trong adminModel

---

## 🎉 Hoàn thành!

Bây giờ bạn đã có chức năng đăng nhập Google hoàn chỉnh cho cả User và Admin!

### Các file đã được tạo/sửa đổi:

**Backend (Server):**
- ✅ `package.json` - Thêm dependencies
- ✅ `models/userModel.js` - Thêm googleId, avatar
- ✅ `models/adminModel.js` - Thêm googleId
- ✅ `controllers/googleAuthController.js` - NEW FILE
- ✅ `routes/userRoute.js` - Thêm Google routes
- ✅ `config/env.js` - Thêm GOOGLE_CLIENT_ID validation

**Frontend Client:**
- ✅ `package.json` - Thêm @react-oauth/google
- ✅ `src/main.jsx` - Wrap với GoogleOAuthProvider
- ✅ `src/pages/Login.jsx` - Thêm Google login button

**Frontend Admin:**
- ✅ `package.json` - Thêm @react-oauth/google
- ✅ `src/main.jsx` - Wrap với GoogleOAuthProvider
- ✅ `src/components/Login.jsx` - Thêm Google login button

---

## 📧 Support

Nếu gặp vấn đề, vui lòng kiểm tra lại từng bước hoặc liên hệ với team development.

**Happy Coding! 🚀**
