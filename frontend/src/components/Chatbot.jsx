import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, RefreshCw } from 'lucide-react';
import axios from 'axios';

// Lấy URL từ biến môi trường hoặc dùng mặc định
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Xin chào! Tôi là trợ lý ảo của GENZ - Shop mũ bảo hiểm. Tôi có thể giúp gì cho bạn?\n\n1️⃣ Tư vấn mua hàng\n2️⃣ Tra cứu bảo hành\n3️⃣ Hỗ trợ kỹ thuật' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState(['Tư vấn mua hàng', 'Tra cứu bảo hành', 'Hỗ trợ kỹ thuật']);

  // Ref để tự động cuộn xuống cuối
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Mỗi khi có tin nhắn mới hoặc mở chat -> cuộn xuống
  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleResetChat = () => {
    setMessages([
      { role: 'assistant', content: 'Xin chào! Tôi là trợ lý ảo của GENZ - Shop mũ bảo hiểm. Tôi có thể giúp gì cho bạn?\n\n1️⃣ Tư vấn mua hàng\n2️⃣ Tra cứu bảo hành\n3️⃣ Hỗ trợ kỹ thuật' }
    ]);
    setQuickReplies(['Tư vấn mua hàng', 'Tra cứu bảo hành', 'Hỗ trợ kỹ thuật']);
    setInput('');
  };

  const sendMessage = async (messageText) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setQuickReplies([]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chatbot/chat`, {
        message: textToSend,
        conversationHistory: messages
      });
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.data.reply
        }
      ]);
      
      if (response.data.quickReplies && response.data.quickReplies.length > 0) {
        setQuickReplies(response.data.quickReplies);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Xin lỗi, hệ thống đang gặp sự cố kết nối. Bạn vui lòng thử lại sau nhé.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý hiển thị text để xuống dòng đẹp
  const formatMessageContent = (text) => {
    // Thay thế dấu * thành xuống dòng + dấu chấm tròn
    // Thay thế dấu ** (nếu có) thành rỗng hoặc ký tự nhấn mạnh
    return text
      .replaceAll('**', '') // Xóa dấu bold của markdown nếu AI trả về
      .replaceAll('* ', '\n• ') // Dấu * có cách
      .replaceAll('*', '\n• '); // Dấu * dính liền
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'linear-gradient(to right, #ec4899, #9333ea)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: 56,
            height: 56,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <MessageCircle size={28} />
        </button>
      )}
      
      {isOpen && (
        <div style={{ width: 360, background: 'white', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', overflow: 'hidden', display: minimized ? 'none' : 'flex', flexDirection: 'column', height: 500 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'linear-gradient(to right, #ec4899, #9333ea)', color: 'white' }}>
            <span style={{ fontWeight: 'bold' }}>Trợ lý ảo GENZ 🤖</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleResetChat} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }} title="Làm mới">
                <RefreshCw size={18} />
              </button>
              <button onClick={() => setMinimized(true)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }} title="Thu nhỏ">
                <Minimize2 size={18} />
              </button>
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }} title="Đóng">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Message List */}
          <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: '#f9fafb' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: 12, textAlign: msg.role === 'assistant' ? 'left' : 'right' }}>
                <div style={{
                  display: 'inline-block',
                  background: msg.role === 'assistant' ? '#e0e7ff' : '#9333ea',
                  color: msg.role === 'assistant' ? '#111' : 'white',
                  borderRadius: 16,
                  padding: '8px 14px',
                  maxWidth: '85%',
                  fontSize: 14,
                  wordBreak: 'break-word',
                  // QUAN TRỌNG: Giữ định dạng xuống dòng
                  whiteSpace: 'pre-wrap', 
                  lineHeight: '1.5'
                }}>
                  {formatMessageContent(msg.content)}
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
               <div style={{ textAlign: 'left', marginBottom: 12 }}>
                 <div style={{ display: 'inline-block', background: '#e0e7ff', padding: '8px 14px', borderRadius: 16, fontSize: 12, fontStyle: 'italic', color: '#666' }}>
                   Đang soạn tin...
                 </div>
               </div>
            )}

            {/* Quick Replies */}
            {quickReplies.length > 0 && !isLoading && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(reply)}
                    style={{
                      background: '#f3e8ff',
                      color: '#9333ea',
                      border: '1px solid #d8b4fe',
                      borderRadius: 16,
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: '500'
                    }}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
            {/* Dummy div để cuộn xuống */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', background: 'white' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                placeholder="Nhập tin nhắn..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: 24,
                  outline: 'none',
                  fontSize: 14,
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                style={{
                  background: 'linear-gradient(to right, #ec4899, #9333ea)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: (isLoading || !input.trim()) ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimized Button */}
      {isOpen && minimized && (
        <button
          onClick={() => setMinimized(false)}
          style={{
            background: 'linear-gradient(to right, #ec4899, #9333ea)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: 56,
            height: 56,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'absolute',
            bottom: 0,
            right: 0,
          }}
        >
          <Maximize2 size={28} />
        </button>
      )}
    </div>
  );
}