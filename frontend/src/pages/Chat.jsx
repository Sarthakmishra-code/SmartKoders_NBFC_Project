import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { chatService } from '../services/chatService';
import { Send, Loader, RotateCcw, Bot, User, Sparkles, MessageCircle } from 'lucide-react';

const Chat = () => {
  const { user } = useApp();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      loadHistory();
    }
  }, [user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadHistory = async () => {
    try {
      const data = await chatService.getChatHistory(user.id);
      setMessages(data.conversations || []);
    } catch (error) {
      console.error('Load history error:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message immediately
    const newUserMsg = {
      message: userMessage,
      sender: 'user',
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMsg]);

    try {
      const response = await chatService.sendMessage(userMessage, user.id);
      
      if (response.success && response.response) {
        const agentMsg = {
          message: response.response.message || 'I received your message.',
          sender: 'agent',
          agent_type: response.agent,
          metadata: JSON.stringify(response.response),
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, agentMsg]);
      }
    } catch (error) {
      console.error('Send message error:', error);
      const errorMsg = {
        message: 'Sorry, I encountered an error. Please try again.',
        sender: 'agent',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset conversation?')) {
      try {
        await chatService.resetConversation(user.id);
        setMessages([]);
      } catch (error) {
        console.error('Reset error:', error);
      }
    }
  };

  const quickActions = [
    { text: 'Apply for loan', action: 'I want to apply for a loan' },
    { text: 'Calculate EMI', action: 'Calculate EMI for ₹5,00,000' },
    { text: 'Upload docs', action: 'What documents do I need?' },
    { text: 'Check eligibility', action: 'Am I eligible for a loan?' }
  ];

  const ChatMessage = ({ message }) => {
    const isUser = message.sender === 'user';
    const metadata = message.metadata ? JSON.parse(message.metadata) : {};

    return (
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexDirection: isUser ? 'row-reverse' : 'row'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isUser ? 'linear-gradient(135deg, #3b82f6, #1e40af)' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          flexShrink: 0
        }}>
          {isUser ? <User size={20} color="white" /> : <Bot size={20} color="white" />}
        </div>

        <div style={{ maxWidth: '70%' }}>
          <div style={{
            padding: '1rem',
            borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
            background: isUser ? 'linear-gradient(135deg, #3b82f6, #1e40af)' : 'white',
            color: isUser ? 'white' : '#1e293b',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: isUser ? 'none' : '1px solid #e2e8f0'
          }}>
            {message.message}
          </div>
          
          {metadata.suggestions && !isUser && (
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {metadata.suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(suggestion)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'white',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', height: 'calc(100vh - 250px)' }}>
      {/* Chat Area */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                AI Assistant
              </h2>
              <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                Online & Ready
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          background: '#f8fafc'
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <MessageCircle size={64} style={{ color: '#cbd5e1', margin: '0 auto 1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                Welcome! How can I help?
              </h3>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                Ask me anything about loans, eligibility, or documents
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: '600px', margin: '0 auto' }}>
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(action.action)}
                    style={{
                      padding: '1rem',
                      background: 'white',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}
                  >
                    {action.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <ChatMessage key={idx} message={msg} />
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                  }}>
                    <Bot size={20} color="white" />
                  </div>
                  <div style={{
                    padding: '1rem',
                    borderRadius: '20px 20px 20px 4px',
                    background: 'white',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%', animation: 'bounce 1s infinite' }}></div>
                      <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }}></div>
                      <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', background: 'white' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              className="form-input"
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-submit"
              style={{ padding: '1rem 2rem' }}
            >
              {loading ? <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={20} />}
            </button>
          </form>
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="dashboard-card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem' }}>
            Quick Tips
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.875rem', color: '#64748b', lineHeight: 1.8 }}>
            <li>• Ask about loan eligibility</li>
            <li>• Calculate your EMI</li>
            <li>• Get document list</li>
            <li>• Check application status</li>
          </ul>
        </div>

        <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #3b82f6, #1e40af)', color: 'white' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Need Help?
          </h3>
          <p style={{ fontSize: '0.875rem', opacity: '0.9', marginBottom: '1rem' }}>
            24/7 Support Available
          </p>
          <button style={{
            width: '100%',
            padding: '0.75rem',
            background: 'white',
            color: '#3b82f6',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;