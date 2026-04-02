import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; // Pudhu import
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  // Unga Google Cloud Console-la kidaicha Client ID-ah inga paste pannunga
  const googleClientId = "31057810821-8fandlc9c7ijtt5ero1mhpgs7lmor1e8.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/student" element={<StudentDashboard />} />
          
          {/* Student Dashboard-ku ippo oru placeholder irukku */}
          <Route path="/student" element={
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <h1>Student Dashboard</h1>
              <p>Welcome! Inga unga vouchers list aagum (Coming Soon).</p>
            </div>
          } />
          
          {/* Register page inime thevaiyillai, aana reference-kaga vachukalam */}
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;