import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import './App.css';
// import FileUpload from './components/FileUpload';
// import StudentChat from './components/StudentChat';
import Login from './components/Login';
import Signup from './components/Signup';
import CreateCourse from './components/CreateCourse';
import CourseChat from './components/CourseChat';
import Landing from './components/Landing';
import { 
  // IconEducatorsSolid, 
  // IconEducatorsLine,
  // IconA11ySolid,
  // IconA11yLine,
  IconCollectionSolid,
  IconCollectionLine
} from './components/CanvasIcons';

function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="left-sidebar">
      <div className="sidebar-items">
        {/* Students and Teachers both see Courses */}
        <div 
          className={`sidebar-item ${location.pathname === '/student' || location.pathname === '/dashboard' ? 'active' : ''}`}
          onClick={() => navigate(user.role === 'teacher' ? '/dashboard' : '/student')}
        >
          <div className="item-icon">
            {(location.pathname === '/student' || location.pathname === '/') ? (
              <IconCollectionSolid />
            ) : (
              <IconCollectionLine />
            )}
          </div>
          <div className="item-label">{user.role === 'teacher' ? 'Dashboard' : 'My Courses'}</div>
        </div>

        <div 
          className="sidebar-item"
          onClick={onLogout}
          style={{ marginTop: 'auto' }}
        >
          <div className="item-label">Logout</div>
        </div>
      </div>
    </div>
  );
}

const subjectColors = {
  'generic': '#75808A',
  'math': '#0374B5',
  'physics': '#7C3AED',
  'english': '#DC2626',
  'computer_science': '#059669',
};

function TeacherView() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch courses');

      const data = await response.json();
      setCourses(data.courses);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectColor = (subject) => {
    return subjectColors[subject] || subjectColors['generic'];
  };

  const totalStudents = courses.reduce((acc, course) => {
    return acc + (course.enrolled_students?.length || 0);
  }, 0);

  if (loading) return (
    <div className="view">
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ 
          fontSize: '48px', 
          marginBottom: '20px',
          animation: 'spin 1s linear infinite'
        }}>⚙️</div>
        <p style={{ color: 'var(--medium-gray)' }}>Loading your courses...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="view">
      <div style={{
        backgroundColor: '#fff5f5',
        border: '2px solid #d01a19',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ color: '#d01a19', marginBottom: '8px' }}>Error Loading Courses</h3>
        <p style={{ color: '#d01a19' }}>{error}</p>
        <button 
          onClick={fetchCourses}
          style={{
            marginTop: '16px',
            padding: '10px 20px',
            backgroundColor: 'var(--canvas-blue)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="view">
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px' 
      }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px', color: 'var(--dark-gray)' }}>
            My Courses
          </h1>
          <p style={{ color: 'var(--medium-gray)', fontSize: '16px' }}>
            Manage your AI teaching assistants
          </p>
        </div>
        <button 
          onClick={() => navigate('/create-course')}
          style={{
            padding: '14px 28px',
            backgroundColor: 'var(--canvas-blue)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(3, 116, 181, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'var(--canvas-blue-hover)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(3, 116, 181, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'var(--canvas-blue)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(3, 116, 181, 0.3)';
          }}
        >
          <span style={{ fontSize: '20px' }}>+</span> Create Course
        </button>
      </div>

      {/* Stats Cards */}
      {courses.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px', 
          marginBottom: '40px' 
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0374B5 0%, #008EE2 100%)',
            padding: '24px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(3, 116, 181, 0.2)'
          }}>
            <div style={{ fontSize: '36px', fontWeight: '900', marginBottom: '8px' }}>
              {courses.length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9, fontWeight: '600' }}>
              Total Courses
            </div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #FC5E13 0%, #FF8A3D 100%)',
            padding: '24px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(252, 94, 19, 0.2)'
          }}>
            <div style={{ fontSize: '36px', fontWeight: '900', marginBottom: '8px' }}>
              {totalStudents}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9, fontWeight: '600' }}>
              Total Students
            </div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #00AC18 0%, #00D921 100%)',
            padding: '24px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0, 172, 24, 0.2)'
          }}>
            <div style={{ fontSize: '36px', fontWeight: '900', marginBottom: '8px' }}>
              {courses.filter(c => c.subject).length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9, fontWeight: '600' }}>
              Active Subjects
            </div>
          </div>
        </div>
      )}

      {/* Courses Grid or Empty State */}
      {courses.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '80px 20px',
          backgroundColor: 'var(--background)',
          borderRadius: '16px',
          border: '2px dashed var(--medium-gray)'
        }}>
          <div style={{ fontSize: '80px', marginBottom: '24px' }}>📚</div>
          <h2 style={{ fontSize: '28px', marginBottom: '16px', color: 'var(--dark-gray)' }}>
            No courses yet
          </h2>
          <p style={{ 
            color: 'var(--medium-gray)', 
            marginBottom: '32px',
            fontSize: '18px',
            maxWidth: '500px',
            margin: '0 auto 32px'
          }}>
            Create your first AI teaching assistant to get started! Upload your course materials and let AI help your students learn.
          </p>
          <button 
            onClick={() => navigate('/create-course')}
            style={{
              padding: '16px 32px',
              backgroundColor: 'var(--canvas-blue)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(3, 116, 181, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(3, 116, 181, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(3, 116, 181, 0.3)';
            }}
          >
            Create Your First Course
          </button>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '24px' 
        }}>
          {courses.map(course => {
            const subjectColor = getSubjectColor(course.subject);
            return (
              <div 
                key={course.id} 
                style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  border: `3px solid ${subjectColor}20`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = `0 12px 40px ${subjectColor}30`;
                  e.currentTarget.style.borderColor = subjectColor;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = `${subjectColor}20`;
                }}
                onClick={() => navigate(`/course/${course.id}`)}
              >
                {/* Subject Color Bar */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '6px',
                  background: `linear-gradient(90deg, ${subjectColor} 0%, ${subjectColor}CC 100%)`
                }} />

                {/* Course Name */}
                <h3 style={{ 
                  marginBottom: '16px', 
                  marginTop: '8px',
                  color: 'var(--dark-gray)',
                  fontSize: '22px',
                  fontWeight: '700'
                }}>
                  {course.name}
                </h3>

                {/* Subject Badge */}
                <div style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  backgroundColor: `${subjectColor}15`,
                  color: subjectColor,
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '700',
                  marginBottom: '12px',
                  textTransform: 'capitalize'
                }}>
                  {course.subject.replace('_', ' ')}
                </div>

                {/* Guardrail Level */}
                <p style={{ 
                  color: 'var(--medium-gray)', 
                  fontSize: '14px', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ fontSize: '16px' }}>🛡️</span>
                  Guardrails: <strong style={{ color: 'var(--dark-gray)' }}>
                    {course.guardrail_level}
                  </strong>
                </p>

                {/* Course Code */}
                <div style={{
                  backgroundColor: 'var(--background)',
                  padding: '12px',
                  borderRadius: '8px',
                  marginTop: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--medium-gray)', display: 'block', marginBottom: '4px' }}>
                      COURSE CODE
                    </span>
                    <div style={{ 
                      fontSize: '20px', 
                      fontWeight: '900', 
                      color: subjectColor,
                      letterSpacing: '2px',
                      fontFamily: 'monospace'
                    }}>
                      {course.course_code}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(course.course_code);
                      // Could add toast notification here
                      alert('Course code copied!');
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: subjectColor,
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StudentView() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch courses');

      const data = await response.json();
      setCourses(data.courses);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCourse = async (e) => {
    e.preventDefault();
    setJoinError('');
    setJoinLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/courses/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ course_code: courseCode.trim().toUpperCase() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to join course');
      }


      setCourseCode('');
      setShowJoinModal(false);
      fetchCourses();
      
      // Success message
      alert(`Successfully joined ${data.course.name}!`);

    } catch (err) {
      setJoinError(err.message);
    } finally {
      setJoinLoading(false);
    }
  };

  const getSubjectColor = (subject) => {
    return subjectColors[subject] || subjectColors['generic'];
  };

  if (loading) return (
    <div className="view">
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ 
          fontSize: '48px', 
          marginBottom: '20px',
          animation: 'spin 1s linear infinite'
        }}>⚙️</div>
        <p style={{ color: 'var(--medium-gray)' }}>Loading your courses...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="view">
      <div style={{
        backgroundColor: '#fff5f5',
        border: '2px solid #d01a19',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ color: '#d01a19', marginBottom: '8px' }}>Error Loading Courses</h3>
        <p style={{ color: '#d01a19' }}>{error}</p>
        <button 
          onClick={fetchCourses}
          style={{
            marginTop: '16px',
            padding: '10px 20px',
            backgroundColor: 'var(--canvas-blue)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="view">
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px' 
      }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px', color: 'var(--dark-gray)' }}>
            My Courses
          </h1>
          <p style={{ color: 'var(--medium-gray)', fontSize: '16px' }}>
            Access your AI tutors and learning materials
          </p>
        </div>
        <button 
          onClick={() => setShowJoinModal(true)}
          style={{
            padding: '14px 28px',
            backgroundColor: 'var(--canvas-blue)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(3, 116, 181, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'var(--canvas-blue-hover)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(3, 116, 181, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'var(--canvas-blue)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(3, 116, 181, 0.3)';
          }}
        >
          <span style={{ fontSize: '20px' }}>+</span> Join Course
        </button>
      </div>

      {/* Stats Cards */}
      {courses.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px', 
          marginBottom: '40px' 
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0374B5 0%, #008EE2 100%)',
            padding: '24px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(3, 116, 181, 0.2)'
          }}>
            <div style={{ fontSize: '36px', fontWeight: '900', marginBottom: '8px' }}>
              {courses.length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9, fontWeight: '600' }}>
              Enrolled Courses
            </div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
            padding: '24px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)'
          }}>
            <div style={{ fontSize: '36px', fontWeight: '900', marginBottom: '8px' }}>
              {new Set(courses.map(c => c.subject)).size}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9, fontWeight: '600' }}>
              Different Subjects
            </div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #00AC18 0%, #00D921 100%)',
            padding: '24px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0, 172, 24, 0.2)'
          }}>
            <div style={{ fontSize: '36px', fontWeight: '900', marginBottom: '8px' }}>
              AI
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9, fontWeight: '600' }}>
              Tutors Available
            </div>
          </div>
        </div>
      )}

      {/* Courses Grid or Empty State */}
      {courses.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '80px 20px',
          backgroundColor: 'var(--background)',
          borderRadius: '16px',
          border: '2px dashed var(--medium-gray)'
        }}>
          <div style={{ fontSize: '80px', marginBottom: '24px' }}>🎓</div>
          <h2 style={{ fontSize: '28px', marginBottom: '16px', color: 'var(--dark-gray)' }}>
            No courses yet
          </h2>
          <p style={{ 
            color: 'var(--medium-gray)', 
            marginBottom: '32px',
            fontSize: '18px',
            maxWidth: '500px',
            margin: '0 auto 32px'
          }}>
            Join a course using a course code from your teacher to access your AI tutor!
          </p>
          <button 
            onClick={() => setShowJoinModal(true)}
            style={{
              padding: '16px 32px',
              backgroundColor: 'var(--canvas-blue)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(3, 116, 181, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(3, 116, 181, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(3, 116, 181, 0.3)';
            }}
          >
            Join Your First Course
          </button>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '24px' 
        }}>
          {courses.map(course => {
            const subjectColor = getSubjectColor(course.subject);
            return (
              <div 
                key={course.id} 
                style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  border: `3px solid ${subjectColor}20`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = `0 12px 40px ${subjectColor}30`;
                  e.currentTarget.style.borderColor = subjectColor;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = `${subjectColor}20`;
                }}
                onClick={() => navigate(`/course/${course.id}/chat`)}
              >
                {/* Subject Color Bar */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '6px',
                  background: `linear-gradient(90deg, ${subjectColor} 0%, ${subjectColor}CC 100%)`
                }} />

                {/* Course Name */}
                <h3 style={{ 
                  marginBottom: '16px', 
                  marginTop: '8px',
                  color: 'var(--dark-gray)',
                  fontSize: '22px',
                  fontWeight: '700'
                }}>
                  {course.name}
                </h3>

                {/* Subject Badge */}
                <div style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  backgroundColor: `${subjectColor}15`,
                  color: subjectColor,
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '700',
                  marginBottom: '16px',
                  textTransform: 'capitalize'
                }}>
                  {course.subject.replace('_', ' ')}
                </div>

                {/* Open Chat Button */}
                <button
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '14px',
                    backgroundColor: subjectColor,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/course/${course.id}/chat`);
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'scale(1.02)';
                    e.target.style.boxShadow = `0 4px 12px ${subjectColor}50`;
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <span style={{ fontSize: '20px' }}>💬</span> Open Chat
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Join Course Modal */}
      {showJoinModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}
        onClick={() => setShowJoinModal(false)}
        >
          <div style={{
            backgroundColor: 'white',
            padding: '48px',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '480px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'slideIn 0.3s ease'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎓</div>
              <h2 style={{ fontSize: '28px', marginBottom: '12px', color: 'var(--dark-gray)' }}>
                Join a Course
              </h2>
              <p style={{ color: 'var(--medium-gray)', fontSize: '16px' }}>
                Enter the course code provided by your teacher
              </p>
            </div>
            
            <form onSubmit={handleJoinCourse}>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                required
                style={{
                  width: '100%',
                  padding: '18px',
                  border: '3px solid var(--canvas-blue)',
                  borderRadius: '12px',
                  fontSize: '24px',
                  fontWeight: '700',
                  textAlign: 'center',
                  letterSpacing: '4px',
                  marginBottom: '20px',
                  textTransform: 'uppercase',
                  fontFamily: 'monospace',
                  backgroundColor: 'var(--background)'
                }}
                maxLength={8}
                autoFocus
              />

              {joinError && (
                <div style={{
                  backgroundColor: '#fff5f5',
                  color: '#d01a19',
                  padding: '14px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: '2px solid #d01a19'
                }}>
                  {joinError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setCourseCode('');
                    setJoinError('');
                  }}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: 'var(--background)',
                    color: 'var(--dark-gray)',
                    border: '2px solid var(--medium-gray)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'var(--medium-gray)';
                    e.target.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'var(--background)';
                    e.target.style.color = 'var(--dark-gray)';
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joinLoading || courseCode.length !== 8}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: 'var(--canvas-blue)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: joinLoading || courseCode.length !== 8 ? 'not-allowed' : 'pointer',
                    opacity: joinLoading || courseCode.length !== 8 ? 0.5 : 1,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    if (!joinLoading && courseCode.length === 8) {
                      e.target.style.backgroundColor = 'var(--canvas-blue-hover)';
                      e.target.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'var(--canvas-blue)';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  {joinLoading ? 'Joining...' : 'Join Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CoursesView() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch courses');

      const data = await response.json();
      setCourses(data.courses);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="view">Loading courses...</div>;
  if (error) return <div className="view">Error: {error}</div>;

  return (
    <div className="view">
      <h2>My Courses</h2>
      {courses.length === 0 ? (
        <p>No courses yet. Teachers can create courses, students can join with a course code.</p>
      ) : (
        <div style={{ display: 'grid', gap: '16px', marginTop: '20px' }}>
          {courses.map(course => (
            <div key={course.id} style={{
              padding: '20px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: 'white'
            }}>
              <h3>{course.name}</h3>
              <p>Subject: {course.subject}</p>
              {course.course_code && <p>Course Code: <strong>{course.course_code}</strong></p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CourseDetails() {
  const { courseId } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  return (
    <div className="view">
      <button 
        onClick={() => navigate(user.role === 'teacher' ? '/' : '/student')}
        style={{
          padding: '8px 16px',
          backgroundColor: 'var(--medium-gray)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        ← Back
      </button>
      
      <h2>Course Details</h2>
      <p>Course ID: {courseId}</p>
      <p style={{ 
        backgroundColor: 'var(--background)', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        📝 Course details page coming soon! This will show:
        <ul style={{ marginTop: '10px', marginLeft: '20px' }}>
          <li>Enrolled students (for teachers)</li>
          <li>Course settings</li>
          <li>Course materials</li>
          <li>Analytics</li>
        </ul>
      </p>
    </div>
  );
}

function ProtectedRoute({ children, isAuthenticated }) {
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsAuthenticated(true);
      setUserRole(JSON.parse(user).role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/login');
  };

  const showSidebar = isAuthenticated && !['/login', '/signup'].includes(location.pathname);

  return (
    <div className="app-layout">
      {showSidebar && <Sidebar onLogout={handleLogout} />}
      <div className="main-content">
        <Routes>
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
          <Route path="/signup" element={<Signup setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
  
          <Route path="/create-course" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              {userRole === 'teacher' ? <CreateCourse /> : <Navigate to="/student" />}
          </ProtectedRoute>
          } />
  
          <Route path="/course/:courseId/chat" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CourseChat />
            </ProtectedRoute>
          } />
  
          <Route path="/course/:courseId" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CourseDetails />
            </ProtectedRoute>
          } />
  
          <Route path="/" element={
            isAuthenticated ? (
              <Navigate to={userRole === 'teacher' ? '/dashboard' : '/student'} />
            ) : (
              <Landing />
            )
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              {userRole === 'teacher' ? <TeacherView /> : <Navigate to="/student" />}
            </ProtectedRoute>
          } />
  
          <Route path="/student" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <StudentView />
            </ProtectedRoute>
          } />
  
          <Route path="/courses" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CoursesView />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;