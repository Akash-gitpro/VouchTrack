import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- CONFIGURATION ---
const API_BASE_URL = "https://vouchtrack-backend.onrender.com";

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const userData = {
                name: name,
                email: email,
                password: password,
                role: "student" 
            };
            
            // URL Updated to Render
            await axios.post(`${API_BASE_URL}/register`, userData);
            
            alert("Registration Success! Ippo Login pannunga.");
            navigate('/'); // Login page-ku pogum
        } catch (err) {
            console.error(err);
            alert("Registration Failed! Email already exists or Backend error.");
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh', 
            backgroundColor: '#f0f2f5' 
        }}>
            <div style={{ 
                padding: '30px', 
                background: 'white', 
                borderRadius: '12px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                width: '350px',
                boxSizing: 'border-box'
            }}>
                <h2 style={{ textAlign: 'center', color: '#1a73e8' }}>Student Registration</h2>
                <form onSubmit={handleRegister}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold' }}>Name:</label><br/>
                        <input 
                            type="text" 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            placeholder="Enter full name"
                            style={inputStyle} 
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold' }}>Email:</label><br/>
                        <input 
                            type="email" 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="Enter email"
                            style={inputStyle} 
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ fontWeight: 'bold' }}>Password:</label><br/>
                        <input 
                            type="password" 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            placeholder="Min 8 characters"
                            style={inputStyle} 
                        />
                    </div>
                    <button type="submit" style={btnStyle}>Register Now</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
                    Already have an account? <span onClick={() => navigate('/')} style={{ color: 'blue', cursor: 'pointer' }}>Login</span>
                </p>
            </div>
        </div>
    );
};

// Simple reusable styles
const inputStyle = {
    width: '100%', 
    padding: '10px', 
    marginTop: '5px', 
    borderRadius: '6px', 
    border: '1px solid #ddd',
    boxSizing: 'border-box'
};

const btnStyle = {
    width: '100%', 
    padding: '12px', 
    background: '#1a73e8', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
};

export default Register;