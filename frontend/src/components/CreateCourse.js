import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateCourse.css';

function CreateCourse() {
  const [courseName, setCourseName] = useState('');
  const [subject, setSubject] = useState('generic');
  const [guardrailLevel, setGuardrailLevel] = useState('moderate');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const navigate = useNavigate();

  const subjects = [
    { value: 'generic', label: 'General' },
    { value: 'math', label: 'Mathematics' },
    { value: 'physics', label: 'Physics' },
    { value: 'english', label: 'English' },
    { value: 'computer_science', label: 'Computer Science' }
  ];

  const guardrails = [
    { value: 'strict', label: 'Strict', description: 'Minimal help, focus on guidance' },
    { value: 'moderate', label: 'Moderate', description: 'Balanced help and learning' },
    { value: 'relaxed', label: 'Relaxed', description: 'More detailed explanations' }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF files are allowed');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    if (!courseName.trim()) {
      setError('Please enter a course name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      // Create course with file upload
      const response = await fetch(
        `http://localhost:8000/api/courses?name=${encodeURIComponent(courseName)}&subject=${subject}&guardrail_level=${guardrailLevel}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to create course');
      }

      const data = await response.json();
      setCourseCode(data.course.course_code);
      
      // Show success for 3 seconds then redirect
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (courseCode) {
    return (
      <div className="create-course-container">
        <div className="success-box">
          <div className="success-icon">✓</div>
          <h2>Course Created Successfully!</h2>
          <p>Share this code with your students:</p>
          <div className="course-code-display">{courseCode}</div>
          <p className="redirect-message">Redirecting to courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-course-container">
      <div className="create-course-box">
        <h1>Create New Course Assistant</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <label>Course Name *</label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g., Biology 101, Algebra II"
              required
            />
          </div>

          <div className="form-section">
            <label>Subject *</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              {subjects.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <label>Guardrail Level *</label>
            <div className="guardrail-options">
              {guardrails.map(g => (
                <div
                  key={g.value}
                  className={`guardrail-option ${guardrailLevel === g.value ? 'active' : ''}`}
                  onClick={() => setGuardrailLevel(g.value)}
                >
                  <div className="guardrail-label">{g.label}</div>
                  <div className="guardrail-description">{g.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label>Course Materials (PDF) *</label>
            <div className="file-upload-area">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                id="file-input"
                style={{ display: 'none' }}
              />
              <label htmlFor="file-input" className="file-upload-label">
                {file ? file.name : 'Choose PDF file'}
              </label>
              {file && (
                <div className="file-selected">
                  ✓ {file.name}
                </div>
              )}
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}

          <button type="submit" className="create-button" disabled={loading}>
            {loading ? 'Creating Course...' : 'Create Course'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateCourse;