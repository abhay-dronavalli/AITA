import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import './StudentChat.css';

function CourseChat() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState('');
  const [courseSubject, setCourseSubject] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dotPosition, setDotPosition] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseDetails();
    const interval = setInterval(() => {
      setDotPosition(prev => (prev + 1) % 3);
    }, 750);
    return () => clearInterval(interval);
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You are not enrolled in this course');
        }
        throw new Error('Failed to fetch course details');
      }

      const data = await response.json();
      setCourseName(data.name);
      setCourseSubject(data.subject);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        // Call the chat API with course-specific context
        const response = await fetch('http://localhost:8001/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: currentQuestion,
            subject: courseSubject,
            course_id: courseId
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

  if (loading) {
    return <div className="chat-container">Loading course...</div>;
  }

  if (error && !courseName) {
    return (
      <div className="chat-container">
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
        <button
          onClick={() => navigate('/student')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'var(--canvas-blue)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Header with course name and back button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '2px solid var(--background)'
      }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--dark-gray)' }}>{courseName}</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--medium-gray)', fontSize: '14px' }}>
            AI Teaching Assistant
          </p>
        </div>
        <button
          onClick={() => navigate('/student')}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--medium-gray)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Back to Courses
        </button>
      </div>

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
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--medium-gray)'
          }}>
            <p>Ask me anything about {courseName}!</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              I'll help you understand the course materials.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-row ${message.sender === 'student' ? 'student' : 'ai'}`}
          >
            <div className={`message-bubble ${message.sender}`}>
              {message.sender === 'ai' ? (
                <ReactMarkdown>{message.text}</ReactMarkdown>
              ) : (
                message.text
              )}
              
              {message.sources && message.sources.length > 0 && (
                <div className="sources-section">
                  <div className="sources-label">📚 Sources:</div>
                  {message.sources.map((source, idx) => {
                    //return (
                        <div key={idx} className="source-item">
                            {source.course || source.course_name || 'Unknown'}
                        </div>
                    //);
                  })}
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
          placeholder="Ask a question about the course..."
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

export default CourseChat;