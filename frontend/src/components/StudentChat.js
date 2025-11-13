import React, { useState, useEffect } from 'react';
import './StudentChat.css';

function StudentChat() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dotPosition, setDotPosition] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDotPosition(prev => (prev + 1) % 3);
    }, 750);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (inputText.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputText,
        sender: 'student'
      };
      
      setMessages([...messages, newMessage]);
      const currentQuestion = inputText;
      setInputText('');
      setIsTyping(true);
      setError('');
      
      try {
        // Call the real chat API
        const response = await fetch('http://localhost:8001/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: currentQuestion,
            subject: 'generic', // TODO: Get from course settings
          })
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Add AI response to messages
        const aiResponse = {
          id: messages.length + 2,
          text: data.answer,
          sender: 'ai',
          sources: data.sources || []
        };
        
        setMessages(prev => [...prev, aiResponse]);
        
      } catch (error) {
        console.error('Chat error:', error);
        setError('Failed to get response. Make sure the chat API is running on port 8001.');
        
        // Add error message to chat
        const errorMessage = {
          id: messages.length + 2,
          text: "Sorry, I encountered an error. Please try again.",
          sender: 'ai'
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      setDotPosition(0);
    }
  };

  const renderDots = () => {
    return (
      <span style={{ color: '#556572' }}>
        {dotPosition === 0 && '●'}
        {dotPosition === 1 && '● ●'}
        {dotPosition === 2 && '● ● ●'}
      </span>
    );
  };

  return (
    <div className="chat-container">
      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          {error}
        </div>
      )}
      
      <div className="chat-area">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-row ${message.sender === 'student' ? 'student' : 'ai'}`}
          >
            <div className={`message-bubble ${message.sender}`}>
              {message.text}
              {message.sources && message.sources.length > 0 && (
                <div style={{ 
                  fontSize: '12px', 
                  marginTop: '8px', 
                  opacity: 0.7,
                  fontStyle: 'italic'
                }}>
                  Sources: {message.sources.map(s => s.course).join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message-row ai">
            <div className="message-bubble ai">
              {renderDots()}
            </div>
          </div>
        )}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about your course..."
          className="chat-input"
          disabled={isTyping}
        />
        <button 
          onClick={handleSend}
          className="send-button"
          disabled={isTyping}
        >
          {isTyping ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default StudentChat;