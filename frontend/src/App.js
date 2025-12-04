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

  if (loading) return <div className="view">Loading courses...</div>;
  if (error) return <div className="view">Error: {error}</div>;

  return (
    <div className="view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>My Courses</h2>
        <button 
          onClick={() => navigate('/create-course')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'var(--canvas-blue)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'var(--canvas-blue-hover)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'var(--canvas-blue)'}
        >
          + Create Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: 'var(--background)',
          borderRadius: '8px'
        }}>
          <h3>No courses yet</h3>
          <p style={{ color: 'var(--medium-gray)', marginBottom: '20px' }}>
            Create your first AI teaching assistant to get started!
          </p>
          <button 
            onClick={() => navigate('/create-course')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--canvas-blue)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Create Your First Course
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {courses.map(course => (
            <div 
              key={course.id} 
              style={{
                padding: '24px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
              onClick={() => navigate(`/course/${course.id}`)}
            >
              <h3 style={{ marginBottom: '12px', color: 'var(--dark-gray)' }}>{course.name}</h3>
              <p style={{ color: 'var(--medium-gray)', fontSize: '14px', marginBottom: '8px' }}>
                Subject: <strong>{course.subject}</strong>
              </p>
              <p style={{ color: 'var(--medium-gray)', fontSize: '14px', marginBottom: '12px' }}>
                Guardrails: <strong>{course.guardrail_level}</strong>
              </p>
              <div style={{
                backgroundColor: 'var(--background)',
                padding: '8px 12px',
                borderRadius: '4px',
                marginTop: '12px'
              }}>
                <span style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>Course Code:</span>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: 'var(--canvas-blue)',
                  letterSpacing: '1px',
                  marginTop: '4px'
                }}>
                  {course.course_code}
                </div>
              </div>
            </div>
          ))}
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

      // Success! Refresh courses and close modal
      setCourseCode('');
      setShowJoinModal(false);
      fetchCourses();
      
      // Show success message (optional)
      alert(`Successfully joined ${data.course.name}!`);

    } catch (err) {
      setJoinError(err.message);
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading) return <div className="view">Loading courses...</div>;
  if (error) return <div className="view">Error: {error}</div>;

  return (
    <div className="view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>My Courses</h2>
        <button 
          onClick={() => setShowJoinModal(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: 'var(--canvas-blue)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'var(--canvas-blue-hover)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'var(--canvas-blue)'}
        >
          + Join Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: 'var(--background)',
          borderRadius: '8px'
        }}>
          <h3>No courses yet</h3>
          <p style={{ color: 'var(--medium-gray)', marginBottom: '20px' }}>
            Join a course using a course code from your teacher!
          </p>
          <button 
            onClick={() => setShowJoinModal(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--canvas-blue)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Join Your First Course
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {courses.map(course => (
            <div 
              key={course.id} 
              style={{
                padding: '24px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
              onClick={() => navigate(`/course/${course.id}/chat`)}
            >
              <h3 style={{ marginBottom: '12px', color: 'var(--dark-gray)' }}>{course.name}</h3>
              <p style={{ color: 'var(--medium-gray)', fontSize: '14px', marginBottom: '8px' }}>
                Subject: <strong>{course.subject}</strong>
              </p>
              <button
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  backgroundColor: 'var(--canvas-blue)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/course/${course.id}/chat`);
                }}
              >
                Open Chat
              </button>
            </div>
          ))}
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
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}
        onClick={() => setShowJoinModal(false)}
        >
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '20px', color: 'var(--dark-gray)' }}>Join a Course</h2>
            <p style={{ marginBottom: '20px', color: 'var(--medium-gray)' }}>
              Enter the course code provided by your teacher
            </p>
            
            <form onSubmit={handleJoinCourse}>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                placeholder="Enter course code"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid var(--medium-gray)',
                  borderRadius: '4px',
                  fontSize: '18px',
                  fontWeight: '600',
                  textAlign: 'center',
                  letterSpacing: '2px',
                  marginBottom: '16px',
                  textTransform: 'uppercase'
                }}
                maxLength={8}
              />

              {joinError && (
                <div style={{
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  padding: '12px',
                  borderRadius: '4px',
                  marginBottom: '16px',
                  fontSize: '14px'
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
                    padding: '12px',
                    backgroundColor: 'var(--medium-gray)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joinLoading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: 'var(--canvas-blue)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: joinLoading ? 'not-allowed' : 'pointer',
                    opacity: joinLoading ? 0.6 : 1
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