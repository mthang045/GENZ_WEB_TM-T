import 'dotenv/config'; // QUAN TRỌNG: Luôn để dòng này đầu tiên
import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import axios from 'axios';

const router = express.Router();

// --- 1. CẤU HÌNH ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = 'genz';
const client = new MongoClient(MONGO_URI);

// Kết nối DB (Chỉ kết nối 1 lần)
async function connectDB() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
    console.log('[MongoDB] Đã kết nối thành công!');
  }
  return client.db(DB_NAME);
}

// --- 2. XỬ LÝ RULE-BASED (Chạy trước, ưu tiên tốc độ) ---
function getRuleBasedResponse(message) {
    const msg = message.toLowerCase().trim();
    console.log('[Rule Check]:', msg);

    // [MỚI] Bắt dính ngay câu hỏi mua hàng chung chung
    if (msg.match(/tư vấn|mua hàng|mua nón|mua mũ|cần mua/i)) {
        return {
            reply: 'Bạn đang tìm loại mũ nào ạ?\n\n🏍️ Fullface (Đi phượt, an toàn nhất)\n🎨 3/4 (Thời trang, đi phố)\n⚡ Nửa đầu (Gọn nhẹ, thoáng mát)',
            quickReplies: ['Mũ Fullface', 'Mũ 3/4', 'Mũ nửa đầu']
        };
    }

    // 2.1. Check sản phẩm cụ thể (Keyword cứng)
    const products = [
      { key: 'm139', name: 'Royal M139', price: '850.000đ' },
      { key: 'yohe 967', name: 'Yohe 967', price: '650.000đ' },
      { key: 'mt-105', name: 'Asia MT-105', price: '280.000đ' },
      { key: 'a102k', name: 'GRS A102K', price: '320.000đ' },
      { key: 'agv k1', name: 'AGV K1', price: '2.500.000đ' }
    ];

    for (const p of products) {
      if (msg.includes(p.key) || msg.includes(p.name.toLowerCase())) {
        return {
          reply: `✅ Sản phẩm ${p.name} đang có giá ${p.price}.\nBạn muốn thêm vào giỏ hàng luôn không?`,
          quickReplies: ['Thêm vào giỏ', 'Xem mẫu khác']
        };
      }
    }

    // 2.2. Check Khoảng giá
    if (msg.match(/dưới ?500|rẻ|sinh viên/i)) {
        return {
          reply: '📗 Dưới 500k bên mình có:\n• Asia MT-105: 280k\n• GRS A102K: 320k\n• Protec Kitty: 450k',
          quickReplies: ['Xem Asia MT-105', 'Xem GRS A102K']
        };
    }

    // 2.3. Tra cứu
    if (msg.match(/tra cứu|đơn hàng|bảo hành/i)) {
        return {
            reply: '🔍 Bạn muốn tra cứu theo cách nào?',
            quickReplies: ['Nhập mã đơn hàng', 'Nhập số điện thoại']
        };
    }
    
    // Check nhập SĐT
    if (msg.match(/(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/)) {
         return {
            reply: 'Dạ shop đã nhận được SĐT. Hệ thống đang kiểm tra đơn hàng của bạn...',
            quickReplies: ['Quay lại menu']
        };
    }

    // 2.4. Chào hỏi & Menu
    if (msg.match(/^(hi|hello|xin chào|chào|hey)$/i) || msg.includes('menu')) {
        return {
          reply: 'Chào bạn! Mình là GENZ Bot 🤖. Mình giúp gì được cho bạn?',
          quickReplies: ['Tư vấn mua hàng', 'Tra cứu đơn hàng', 'Địa chỉ shop']
        };
    }

    // Nếu không khớp Rule nào -> Trả về null để gọi AI
    return null; 
}

// --- 3. XỬ LÝ AI (GROQ) ---
async function getGroqAIResponse(message, conversationHistory) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return 'Lỗi: Chưa cấu hình API Key trong file .env';

  // Lấy dữ liệu sản phẩm từ MongoDB để AI "học"
  let productContext = "";
  try {
    const db = await connectDB();
    const products = await db.collection('products').find({}).limit(10).toArray();
    if (products.length > 0) {
        productContext = products.map(p => `- ${p.name}: ${p.price}`).join('\n');
    } else {
        productContext = "Hiện chưa có dữ liệu sản phẩm.";
    }
  } catch (e) { console.error('Lỗi DB:', e); }

  const systemPrompt = `Bạn là nhân viên shop GENZ Helmet. 
  Dữ liệu sản phẩm thực tế:
  ${productContext}
  
  Quy tắc:
  1. Tư vấn ngắn gọn, vui vẻ, dùng emoji.
  2. Chỉ tư vấn sản phẩm có trong danh sách trên.
  3. Nếu không biết, hãy bảo khách gọi hotline 0877772244.`;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        // [ĐÃ SỬA] Đổi sang model Llama 3.3 70B mới nhất như trong ảnh của bạn
        model: 'llama-3.3-70b-versatile', 
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 300
      },
      { headers: { 'Authorization': `Bearer ${apiKey}` } }
    );
    return response.data.choices[0].message.content;
  } catch (err) {
    console.error('Lỗi Groq API:', err.response ? err.response.data : err.message);
    return 'Xin lỗi, server đang bận. Bạn hỏi lại câu khác giúp mình nhé!';
  }
}

// --- 4. API ENDPOINT ---
router.post('/chat', async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        if (!message) return res.status(400).json({ error: 'Message empty' });

        // Bước 1: Thử Rule trước
        const ruleRes = getRuleBasedResponse(message);
        if (ruleRes) {
            return res.json({ ...ruleRes, source: 'rule' });
        }

        // Bước 2: Gọi AI nếu không khớp Rule
        console.log('-> Gọi AI cho câu:', message);
        const aiRes = await getGroqAIResponse(message, conversationHistory);
        res.json({
            reply: aiRes,
            quickReplies: ['Tư vấn Fullface', 'Tra cứu đơn hàng'],
            source: 'ai'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Error' });
    }
});

export default router;