# 🎄 Forever - E-commerce Platform

> Nền tảng thương mại điện tử với tích hợp AI chatbot, hệ thống review, và thanh toán MoMo.

## 📋 Tính Năng Chính

### ✨ Core Features
- **Xác thực & Phân quyền**: JWT-based auth, User/Admin roles
- **Quản lý sản phẩm**: CRUD operations, categories, best sellers
- **Giỏ hàng & Đặt hàng**: Real-time cart, multiple payment methods
- **Hệ thống review**: Rating, images, pending reviews tracking
- **Chat real-time**: WebSocket-based, AI Bot integration
- **Thanh toán**: COD, MoMo payment gateway

### 🔐 Security Features
- Rate limiting (brute-force protection)
- Input sanitization (XSS, NoSQL injection prevention)
- JWT token-based authentication
- CORS configuration
- Helmet security headers
- Password hashing (bcrypt)

### 🤖 AI Integration
- Google Gemini AI Bot for customer support
- Context-aware responses
- Fallback to human support
- Conversation history tracking

### 📊 Analytics & Admin
- Revenue tracking (monthly, by category, by subcategory)
- Order management & status updates
- User chat monitoring
- Product performance metrics

## 🚀 Tech Stack

### Backend
```
Node.js + Express.js
MongoDB + Mongoose
Socket.IO (WebSocket)
Cloudinary (Image hosting)
Google Generative AI (Chatbot)
JWT (Authentication)
```

### Frontend
```
React + Vite
React Router v6
Tailwind CSS
Socket.IO Client
Axios
```

### Admin Panel
```
React + Vite
Same tech stack as frontend
```

## 📦 Installation

### Prerequisites
- Node.js >= 16
- MongoDB
- Cloudinary account
- MoMo Developer account
- Google Generative AI key

### Backend Setup
\`\`\`bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npm run server
\`\`\`

### Frontend Setup
\`\`\`bash
cd client
npm install
npm run dev
\`\`\`

### Admin Setup
\`\`\`bash
cd admin
npm install
npm run dev
\`\`\`

## 🔑 Environment Variables

### Server (.env)
\`\`\`
PORT=4000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin_password
CLOUDINARY_NAME=your_cloudinary
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MOMO_PARTNER_CODE=...
MOMO_ACCESS_KEY=...
MOMO_SECRET_KEY=...
GOOGLE_GEMINI_API_KEY=...
\`\`\`

## 📝 API Endpoints

### Users
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/admin` - Admin login

### Products
- `GET /api/product/list` - Get all products
- `GET /api/product/single?productId=...` - Get single product
- `POST /api/product/add` - Add product (admin)
- `DELETE /api/product/remove` - Remove product (admin)

### Orders
- `POST /api/order/place` - Place COD order
- `POST /api/order/place/momo` - Place MoMo order
- `GET /api/order/userorders` - Get user orders
- `GET /api/order/list` - Get all orders (admin)
- `PUT /api/order/status` - Update order status (admin)

### Reviews
- `POST /api/review/add` - Add review
- `GET /api/review/product/:productId` - Get product reviews
- `GET /api/review/user` - Get user reviews
- `PUT /api/review/update/:reviewId` - Update review
- `DELETE /api/review/delete/:reviewId` - Delete review

### Chat
- WebSocket connection for real-time messaging
- AI Bot auto-responses

## 🔒 Security Best Practices

✅ Implemented:
- Rate limiting on auth endpoints (5 attempts/15min)
- Input validation & sanitization
- JWT token expiration
- MongoDB injection prevention
- XSS protection with xss-clean
- Security headers with Helmet
- CORS configuration
- Password hashing (10 salt rounds)

## 📊 Database Schema

### Collections
1. **users** - User accounts & favorite products
2. **products** - Product catalog
3. **carts** - User shopping carts
4. **orders** - Order history & status
5. **reviews** - Product reviews with ratings
6. **chatmessages** - Chat history
7. **revenuetrackers** - Analytics data

## 🧪 Testing

### Manual Testing
- Register new user account
- Browse products & filter by category
- Add to cart & place orders (COD)
- Submit product reviews
- Chat with AI Bot
- Admin: Add/edit products, track orders, monitor revenue

## 📈 Performance Optimization

- Image optimization via Cloudinary
- Database indexing on frequently queried fields
- Socket.IO connection pooling
- Rate limiting to prevent abuse
- Efficient query pagination

## 🐛 Error Handling

All endpoints return consistent error responses:
\`\`\`json
{
  "success": false,
  "message": "Error description"
}
\`\`\`

## 📦 Deployment

### Backend
- Deployed on [Your Platform]
- Environment variables configured
- MongoDB Atlas for database
- Cloudinary for media storage

### Frontend
- Deployed on Vercel/Netlify
- Build optimization
- CDN for static assets

## 📄 License

MIT License

## 👥 Contributors

- Frontend: [Your Name]
- Backend: [Your Name]
- Admin: [Your Name]

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Last Updated**: 2024
