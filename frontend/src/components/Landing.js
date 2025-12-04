import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-content">
          <div className="logo">
            <span className="logo-text">AIT<span className="logo-highlight">A</span></span>
          </div>
          <div className="nav-links">
            <button onClick={() => navigate('/login')} className="nav-link">Login</button>
            <button onClick={() => navigate('/signup')} className="nav-button">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-left">
            <h1 className="hero-title">
              Transform Your Teaching with <span className="gradient-text">AI</span>
            </h1>
            <p className="hero-subtitle">
              Create course-specific AI tutors in minutes. Upload your materials, and let AI help your students learn better - without giving away the answers.
            </p>
            <div className="hero-buttons">
              <button 
                onClick={() => navigate('/signup')} 
                className="cta-primary"
              >
                Get Started Free
              </button>
              <button 
                onClick={() => {
                  document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' });
                }}
                className="cta-secondary"
              >
                Learn More
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">5+</div>
                <div className="stat-label">Subjects</div>
              </div>
              <div className="stat">
                <div className="stat-number">RAG</div>
                <div className="stat-label">Powered</div>
              </div>
              <div className="stat">
                <div className="stat-number">100%</div>
                <div className="stat-label">Free</div>
              </div>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-illustration">
              <div className="illustration-card card-1">
                <div className="card-icon">👩‍🏫</div>
                <div className="card-text">Upload Course Materials</div>
              </div>
              <div className="illustration-card card-2">
                <div className="card-icon">🤖</div>
                <div className="card-text">AI Learning Assistant</div>
              </div>
              <div className="illustration-card card-3">
                <div className="card-icon">👨‍🎓</div>
                <div className="card-text">Students Learn Better</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why Teachers Love AITA</h2>
          <p>Powerful features designed for modern education</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Course-Specific AI</h3>
            <p>Upload your PDFs and create an AI tutor that knows your exact course materials. No generic answers.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Educational Guardrails</h3>
            <p>Subject-specialized models that guide students to learn rather than giving direct answers. Maintains academic integrity.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Setup in Minutes</h3>
            <p>Upload materials, generate a course code, and share with students. That's it. No complex configuration needed.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-section">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Three simple steps to create your AI teaching assistant</p>
        </div>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Create Your Course</h3>
              <p>Sign up as a teacher and upload your course materials (PDFs). Choose your subject and set guardrail levels.</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Share Course Code</h3>
              <p>Get a unique 8-character code. Share it with your students so they can join your course instantly.</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Students Learn</h3>
              <p>Students chat with the AI tutor that's grounded in your materials. The AI guides them without giving answers away.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="subjects-section">
        <div className="section-header">
          <h2>Specialized by Subject</h2>
          <p>Each subject has custom guardrails designed for optimal learning</p>
        </div>
        <div className="subjects-grid">
          <div className="subject-badge">
            <span className="subject-icon">📐</span>
            <span>Math</span>
          </div>
          <div className="subject-badge">
            <span className="subject-icon">⚛️</span>
            <span>Physics</span>
          </div>
          <div className="subject-badge">
            <span className="subject-icon">✍️</span>
            <span>English</span>
          </div>
          <div className="subject-badge">
            <span className="subject-icon">💻</span>
            <span>Computer Science</span>
          </div>
          <div className="subject-badge">
            <span className="subject-icon">🎓</span>
            <span>General</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Teaching?</h2>
          <p>Join teachers who are using AI to enhance student learning while maintaining academic integrity.</p>
          <div className="cta-buttons">
            <button 
              onClick={() => navigate('/signup')} 
              className="cta-primary large"
            >
              Get Started as Teacher
            </button>
            <button 
              onClick={() => navigate('/signup')} 
              className="cta-secondary large"
            >
              Get Started as Student
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>AIT<span style={{ color: 'var(--warning-orange)' }}>A</span></h4>
            <p>AI Teaching Assistant for modern education</p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <a onClick={() => navigate('/signup')}>Get Started</a>
            <a onClick={() => navigate('/login')}>Login</a>
          </div>
          <div className="footer-section">
            <h4>About</h4>
            <p>Affiliated with the UF GatorAI Club</p>
            <p>University of Florida</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 AITA.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;