import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import FileUpload from './components/FileUpload';
import StudentChat from './components/StudentChat';
import Login from './components/Login';
import Signup from './components/Signup';
import { 
  IconEducatorsSolid, 
  IconEducatorsLine,
  IconA11ySolid,
  IconA11yLine,
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
        {user.role === 'student' && (
          <div 
            className={`sidebar-item ${location.pathname === '/student' ? 'active' : ''}`}
            onClick={() => navigate('/student')}
          >
            <div className="item-icon">
              {location.pathname === '/student' ? (
                <IconA11ySolid />
              ) : (
                <IconA11yLine />
              )}
            </div>
            <div className="item-label">Chat</div>
          </div>
        )}
        
        {user.role === 'teacher' && (
          <div 
            className={`sidebar-item ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            <div className="item-icon">
              {location.pathname === '/' ? (
                <IconEducatorsSolid />
              ) : (
                <IconEducatorsLine />
              )}
            </div>
            <div className="item-label">Dashboard</div>
          </div>
        )}
        
        <div 
          className={`sidebar-item ${location.pathname === '/courses' ? 'active' : ''}`}
          onClick={() => navigate('/courses')}
        >
          <div className="item-icon">
            {location.pathname === '/courses' ? (
              <IconCollectionSolid />
            ) : (
              <IconCollectionLine />
            )}
          </div>
          <div className="item-label">Courses</div>
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
  return (
    <div className="view">
      <h2>Teacher Dashboard</h2>
      <p>Create and manage your course AI assistants.</p>
      <FileUpload/>
    </div>
  );
}

function StudentView() {
  return <StudentChat />;
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
          
          <Route path="/" element={
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