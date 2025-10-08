import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import './App.css';

// Placeholder components for views
function TeacherView() {
  return (
    <div className="view">
      <h2>Teacher Dashboard</h2>
      <p>Course setup, content management, and guardrail configuration will go here.</p>
    </div>
  );
}

function StudentView() {
  return (
    <div className="view">
      <h2>Student Chat Interface</h2>
      <p>React-based chat system for Q&A will go here.</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>AI Teaching Assistant</h1>
          <nav>
            <NavLink to="/" exact activeClassName="active" className="nav-link">
              Teacher View
            </NavLink>
            {' | '}
            <NavLink to="/student" activeClassName="active" className="nav-link">
              Student View
            </NavLink>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<TeacherView />} />
            <Route path="/student" element={<StudentView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;