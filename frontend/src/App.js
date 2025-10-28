import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import FileUpload from './components/FileUpload';
import StudentChat from './components/StudentChat';
import { 
  IconEducatorsSolid, 
  IconEducatorsLine,
  IconA11ySolid,
  IconA11yLine,
  IconCollectionSolid,
  IconCollectionLine
} from './components/CanvasIcons';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="left-sidebar">
      <div className="sidebar-items">
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
          <div className="item-label">Student</div>
        </div>
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
          <div className="item-label">Teacher</div>
        </div>
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
      </div>
    </div>
  );
}

function TeacherView() {
  return (
    <div className="view">
      <h2>Teacher Dashboard</h2>
      <p>Course setup, content management, and guardrail configuration will go here.</p>
      <FileUpload/>
    </div>
  );
}

function StudentView() {
  return <StudentChat />;
}

function CoursesView() {
  return (
    <div className="view">
      <h2>Courses</h2>
      <p>Course content will go here.</p>
    </div>
  );
}

function AppContent() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<TeacherView />} />
          <Route path="/student" element={<StudentView />} />
          <Route path="/courses" element={<CoursesView />} />
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