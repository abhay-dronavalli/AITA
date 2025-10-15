import React, { useState, useEffect } from 'react';
import './StudentChat.css';

function StudentChat() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dotPosition, setDotPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotPosition(prev => (prev + 1) % 3);
    }, 750);
    return () => clearInterval(interval);
  }, []);

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputText,
        sender: 'student'
      };
      
      setMessages([...messages, newMessage]);
      setInputText('');
      setIsTyping(true);
      
      setTimeout(() => {
        const aiResponse = {
          id: messages.length + 2,
          text: "This is a mock AI response.",
          sender: 'ai'
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 4500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      setDotPosition(0);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-area">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-row ${message.sender === 'student' ? 'student' : 'ai'}`}
          >
            <div className={`message-bubble ${message.sender}`}>
              {message.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message-row ai">
            <div className="message-bubble ai">
              {dotPosition === 0 && '●'}
              {dotPosition === 1 && '● ●'}
              {dotPosition === 2 && '● ● ●'}
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
          placeholder="Type your message..."
          className="chat-input"
        />
        <button 
          onClick={handleSend}
          className="send-button"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default StudentChat;