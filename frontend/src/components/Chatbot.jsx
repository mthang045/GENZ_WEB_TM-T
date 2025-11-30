import { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, X, Send } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

export default function Chatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const defaultWelcome = useMemo(() => ({
    role: 'assistant',
    content: 'Xin chào! Tôi là trợ lý ảo của GENZ - Shop mũ bảo hiểm. Tôi có thể giúp gì cho bạn?\n\n1️⃣ Tư vấn mua hàng\n\n2️⃣ Tra cứu bảo hành\n\n3️⃣ Hỗ trợ kỹ thuật'
  }), []);
  const [messages, setMessages] = useState([defaultWelcome]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState(['Tư vấn mua hàng', 'Tra cứu bảo hành', 'Hỗ trợ kỹ thuật']);
  const messagesEndRef = useRef(null);

  // Lấy lịch sử hội thoại khi mở Chatbot
  useEffect(() => {
    if (isOpen && user) {
      (async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API_URL}/chatbot/chat/history`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.messages && res.data.messages.length > 0) {
            setMessages(res.data.messages);
          } else {
            setMessages([defaultWelcome]);
          }
        } catch (e) {
          setMessages([defaultWelcome]);
        }
      })();
    }
  }, [defaultWelcome, isOpen, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (messageText) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;
    const userMessage = { role: 'user', content: textToSend };
    const conversationHistory = [...messages];
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setQuickReplies([]);
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/chatbot/chat`, {
        message: textToSend,
        conversationHistory
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.reply
      }]);
      if (response.data.quickReplies && response.data.quickReplies.length > 0) {
        setQuickReplies(response.data.quickReplies);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (reply) => {
    sendMessage(reply);
  };

  if (!user) {
    return (
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
        <button
          onClick={() => alert('Vui lòng đăng nhập để sử dụng Chatbot AI!')}
          style={{
            background: 'linear-gradient(to right, #ec4899, #9333ea)',
            color: 'white',
            padding: '16px',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <MessageCircle size={28} />
        </button>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'linear-gradient(to right, #ec4899, #9333ea)',
            color: 'white',
            padding: '16px',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <MessageCircle size={28} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      <div style={{ width: '350px', height: '500px', background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'linear-gradient(to right, #ec4899, #9333ea)', color: 'white' }}>
          <span style={{ fontWeight: 'bold' }}>GENZ Chatbot</span>
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: '12px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
              <div style={{
                display: 'inline-block',
                background: msg.role === 'user' ? 'linear-gradient(to right, #ec4899, #9333ea)' : '#f3f4f6',
                color: msg.role === 'user' ? 'white' : '#111827',
                borderRadius: '16px',
                padding: '10px 16px',
                fontSize: '14px',
                maxWidth: '80%'
              }}>
                {msg.content.split('\n').map((line, i) => (
                  <>
                    {i > 0 && <br />}
                    {line}
                  </>
                ))}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {quickReplies.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', padding: '0 16px 8px 16px', flexWrap: 'wrap' }}>
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickReply(reply)}
                style={{
                  background: '#f3f4f6',
                  color: '#9333ea',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '6px 14px',
                  marginBottom: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500
                }}
              >
                {reply}
              </button>
            ))}
          </div>
        )}
        <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Nhập tin nhắn..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '24px',
                outline: 'none',
                fontSize: '14px'
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
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: (isLoading || !input.trim()) ? 0.5 : 1
              }}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
