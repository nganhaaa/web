import { GoogleGenerativeAI } from '@google/generative-ai';
import productModel from '../models/productModel.js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Cache for products (refresh every 10 minutes)
let productsCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Fetch and cache products from database
const getProductsContext = async () => {
  const now = Date.now();
  
  // Return cached data if still valid
  if (productsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return productsCache;
  }
  
  try {
    // Fetch products from database
    // Get bestsellers first, then some random products (limit to 20 to avoid token limit)
    const bestsellers = await productModel.find({ bestseller: true }).limit(10).lean();
    const regularProducts = await productModel.find({ bestseller: { $ne: true } }).limit(10).lean();
    
    const products = [...bestsellers, ...regularProducts];
    
    // Format products for AI context
    const formattedProducts = products.map(p => {
      return `- ${p.name} (${p.category}/${p.subCategory}): $${p.price} - ${p.description.substring(0, 100)}... [Sizes: ${p.sizes.join(', ')}]${p.bestseller ? ' ⭐ BESTSELLER' : ''}`;
    }).join('\n');
    
    const context = `\nSẢN PHẨM CÓ SẴN TRONG SHOP:\n${formattedProducts}\n\nLưu ý: Khi khách hỏi về sản phẩm cụ thể, hãy đề xuất từ danh sách trên và nói rõ giá, size có sẵn.\n`;
    
    // Update cache
    productsCache = context;
    cacheTimestamp = now;
    
    return context;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return '\n(Dữ liệu sản phẩm đang được cập nhật...)\n';
  }
};

// System prompt to define bot personality and behavior
const SYSTEM_PROMPT = `Bạn là trợ lý ảo thông minh của cửa hàng thời trang Forever. Nhiệm vụ của bạn:

1. Chào đón và hỗ trợ khách hàng một cách thân thiện, lịch sự
2. Trả lời các câu hỏi về:
   - Sản phẩm: quần áo, giày dép, phụ kiện thời trang
   - Giá cả và khuyến mãi
   - Chính sách đổi trả: Trong vòng 7 ngày nếu còn nguyên tem mác, chưa qua sử dụng
   - Giao hàng: 2-5 ngày trong nội thành, 5-7 ngày ngoại thành
   - Thanh toán: Hỗ trợ COD, chuyển khoản, thẻ tín dụng, Stripe, MoMo
   
3. Hướng dẫn sử dụng website:
   - Cách đặt hàng: Chọn sản phẩm → Thêm vào giỏ → Checkout
   - Cách theo dõi đơn hàng: Vào mục "Orders" sau khi đăng nhập
   - Cách tạo tài khoản và đăng nhập

4. Xử lý tình huống:
   - Nếu câu hỏi quá phức tạp hoặc cần hỗ trợ đặc biệt → "Để tôi kết nối bạn với nhân viên hỗ trợ nhé!"
   - Luôn trả lời bằng tiếng Việt
   - Câu trả lời ngắn gọn, súc tích (2-4 câu)
   - Thân thiện, nhiệt tình, chuyên nghiệp

5. Không được:
   - Cung cấp thông tin sai lệch về shop
   - Đưa ra lời khuyên y tế, pháp lý
   - Nói xấu đối thủ cạnh tranh
   - Trả lời những câu hỏi không liên quan đến shop thời trang

Phong cách: Giống như một nhân viên bán hàng thân thiện, am hiểu sản phẩm và luôn sẵn sàng giúp đỡ!`;

// Generate AI response
const generateAIResponse = async (userMessage, conversationHistory = []) => {
  try {
    // Use Gemini 2.5 Flash (free tier, fastest)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
    });

    // Get products context from database
    const productsContext = await getProductsContext();

    // Build conversation context
    let context = SYSTEM_PROMPT + '\n' + productsContext + '\n';
    
    // Add recent conversation history (last 5 messages for context)
    if (conversationHistory.length > 0) {
      context += '\nLịch sử chat gần đây:\n';
      conversationHistory.slice(-5).forEach(msg => {
        const role = msg.sender === 'admin' || msg.sender === 'bot' ? 'Bot' : 'Khách';
        context += `${role}: ${msg.message}\n`;
      });
      context += '\n';
    }

    context += `Khách hàng: ${userMessage}\n\nBot:`;

    // Generate response
    const result = await model.generateContent(context);
    const response = await result.response;
    const text = response.text();

    return text.trim();
  } catch (error) {
    console.error('❌ Gemini AI Error:', error);
    
    // Fallback responses based on error type
    if (error.message?.includes('API key')) {
      return 'Xin lỗi, hệ thống AI tạm thời không khả dụng. Vui lòng đợi nhân viên hỗ trợ hoặc thử lại sau. 🙏';
    }
    
    if (error.message?.includes('quota')) {
      return 'Hệ thống đang quá tải. Vui lòng đợi nhân viên hỗ trợ hoặc thử lại sau ít phút. 🙏';
    }
    
    // Generic fallback
    return 'Xin lỗi, tôi không hiểu rõ câu hỏi của bạn. Bạn có thể nói rõ hơn được không? Hoặc để tôi kết nối bạn với nhân viên hỗ trợ nhé! 😊';
  }
};

// Check if message should trigger AI response
const shouldRespondWithAI = (message, sender) => {
  // Don't respond to admin messages
  if (sender === 'admin' || sender === 'bot') {
    return false;
  }
  
  // Respond to all user messages
  return true;
};

// Extract keywords from message (for analytics/logging)
const extractKeywords = (message) => {
  const keywords = {
    greeting: ['xin chào', 'hello', 'hi', 'chào', 'hey', 'alo'],
    product: ['sản phẩm', 'quần áo', 'áo', 'váy', 'giày', 'đồ', 'mua'],
    price: ['giá', 'bao nhiêu', 'giá cả', 'chi phí', 'tiền'],
    order: ['đặt hàng', 'order', 'mua hàng'],
    shipping: ['giao hàng', 'ship', 'vận chuyển', 'nhận hàng'],
    return: ['đổi', 'trả', 'hoàn', 'bảo hành', 'đổi trả'],
    payment: ['thanh toán', 'trả tiền', 'payment', 'momo', 'cod'],
    help: ['giúp', 'hỗ trợ', 'help', 'trợ giúp'],
  };

  const lowerMessage = message.toLowerCase();
  const found = [];

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => lowerMessage.includes(word))) {
      found.push(category);
    }
  }

  return found;
};

export { generateAIResponse, shouldRespondWithAI, extractKeywords };
