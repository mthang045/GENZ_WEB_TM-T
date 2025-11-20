import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { db } from '../app.js';

dotenv.config();

const router = express.Router();

if (!process.env.GROQ_API_KEY) console.error("❌ LỖI: Chưa thấy GROQ_API_KEY");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 1. DỮ LIỆU SẢN PHẨM CHI TIẾT (KIẾN THỨC CHO AI)
// Bạn có thể viết càng chi tiết càng tốt, AI sẽ tự lọc ý để trả lời
const PRODUCT_KNOWLEDGE = `
CHI TIẾT SẢN PHẨM CỦA SHOP:

1. Mũ Fullface Royal M139 (Best Seller)
   - Giá bán: 850.000đ.
   - Phong cách: Cổ điển (Classic/Vintage), form tròn, kính âm độc đáo.
   - Kính: Kính âm toàn phần (kéo lên là giấu vào trong mũ), màu khói trà đi được cả ngày và đêm.
   - Chất liệu: Nhựa ABS nguyên sinh (chống va đập cao).
   - Trọng lượng: Khoảng 1050g (Khá nhẹ so với fullface thường).
   - Lót mũ: Vải nâu đất vintage, tháo rời giặt được, kháng khuẩn.
   - Màu sắc: Đen nhám, Đen bóng, Trắng, Xám xi măng, Vàng nghệ.
   - Phù hợp: Đi phố, đi cafe, đi tour ngắn. Nam nữ đều đội đẹp.

2. Mũ Fullface AGV K1 (Cao cấp)
   - Giá bán: 2.500.000đ.
   - Phong cách: Thể thao, Racing, đuôi gió dài (spoiler) tăng khí động học.
   - Chất liệu: Nhựa High Resistance Thermoplastic.
   - Kính: Góc nhìn rộng 190 độ, chống trầy xước.
   - Hệ thống gió: 5 hốc gió trước, 2 hốc thoát sau (cực mát).
   - Khóa: Double D-Ring (chuẩn đua xe an toàn nhất).

3. Mũ 3/4 Asia MT-115
   - Giá bán: 420.000đ.
   - Đặc điểm: Kính dài che hết mặt, form nhỏ gọn.
   - Tiện ích: Kính chống tia UV, bền bỉ.
`;

// 2. SYSTEM PROMPT (NÂNG CẤP)
const SHOP_CONTEXT = `
Bạn là trợ lý ảo của "GENZ - Shop mũ bảo hiểm".
Ngôn ngữ: Tiếng Việt. Phong cách: Thân thiện, dùng icon 🏍️.

DỮ LIỆU SẢN PHẨM:
${PRODUCT_KNOWLEDGE}

QUY TẮC TRẢ LỜI QUAN TRỌNG:
1. Nếu khách hỏi chung chung (VD: "Tư vấn mũ M139"): Chỉ trả lời tóm tắt gồm: Tên, Giá, và 1 điểm nổi bật nhất. Sau đó hỏi khách có muốn xem chi tiết không.
2. Nếu khách hỏi sâu (VD: "Chi tiết hơn đi", "Nặng không", "Chất liệu gì", "Có màu gì"): Hãy tìm trong DỮ LIỆU SẢN PHẨM để trả lời chính xác câu hỏi đó.
3. Không bịa đặt thông tin không có trong dữ liệu.
`;

// ... (Giữ nguyên hàm checkWarrantyStatus và formatHistoryForGroq như cũ) ...
// Để code gọn, tôi giả định bạn giữ lại đoạn code tra cứu bảo hành ở câu trả lời trước tại đây
// Nếu bạn muốn tôi paste lại toàn bộ 100% file thì bảo tôi nhé.

async function checkWarrantyStatus(phoneNumber) {
  try {
    if (!db) return null;
    const orders = await db.collection('orders').find({
      $or: [{ phone: phoneNumber }, { 'shippingAddress.phone': phoneNumber }]
    }).sort({ createdAt: -1 }).limit(1).toArray();
    
    if (!orders || orders.length === 0) return null;

    const order = orders[0];
    const purchaseDate = new Date(order.createdAt || order.date);
    const expireDate = new Date(purchaseDate);
    expireDate.setMonth(expireDate.getMonth() + 12);
    const isActive = new Date() < expireDate;
    
    return `SĐT ${phoneNumber} mua đơn hàng ${order._id} ngày ${purchaseDate.toLocaleDateString('vi-VN')}. Trạng thái: ${isActive ? "✅ Còn bảo hành" : "❌ Hết bảo hành"}.`;
  } catch (e) { return null; }
}

// ...

function formatHistoryForGroq(history) {
    if (!Array.isArray(history)) return [];
    return history.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user', 
      content: msg.content
    }));
  }
  
  function generateQuickReplies(text) {
    const lowerText = text.toLowerCase();
    const replies = [];
    // Logic gợi ý nút bấm thông minh dựa trên câu trả lời AI
    if (lowerText.includes('m139')) replies.push('Màu sắc M139?', 'Kính M139 thế nào?');
    if (lowerText.includes('giá')) replies.push('Tư vấn theo giá');
    if (replies.length === 0) replies.push('Tư vấn mua hàng', 'Tra cứu bảo hành');
    return replies.slice(0, 4);
  }

router.options('/chat', cors());

router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    let systemContextWithData = SHOP_CONTEXT;

    // Check SĐT để tra bảo hành (Giữ nguyên logic cũ)
    const phoneRegex = /(0[3|5|7|8|9][0-9]{8})\b/g;
    const foundPhones = message.match(phoneRegex);
    if (foundPhones) {
       const info = await checkWarrantyStatus(foundPhones[0]);
       if (info) systemContextWithData += `\n\nTHÔNG TIN BẢO HÀNH KHÁCH HÀNG: ${info}`;
       else systemContextWithData += `\n\nLƯU Ý: Không tìm thấy đơn hàng cho SĐT ${foundPhones[0]}.`;
    }

    const messages = [
      { role: "system", content: systemContextWithData }, 
      ...formatHistoryForGroq(conversationHistory),
      { role: "user", content: message }
    ];

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile", // Model này rất giỏi đọc hiểu context dài
      temperature: 0.6, 
      max_tokens: 1024,
    });

    const replyText = completion.choices[0]?.message?.content || "Shop đang bận xíu.";

    res.json({
      reply: replyText,
      quickReplies: generateQuickReplies(replyText)
    });

  } catch (error) {
    console.error("❌ GROQ ERROR:", error);
    res.json({ reply: "Lỗi kết nối AI.", quickReplies: [] });
  }
});

export default router;