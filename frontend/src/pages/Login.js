import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- CONFIGURATION ---
const API_BASE_URL = "https://vouchtrack-backend.onrender.com";

const Login = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            const userEmail = decoded.email;

            // Email Domain Check
            if (!userEmail.endsWith("@karunya.edu.in") && 
                !userEmail.endsWith("@karunya.edu") && 
                userEmail !== "mcsoftadmin7@gmail.com") {
                
                setError("Please use your Karunya College Mail ID!");
                return;
            }

            // Backend Login Call - URL Updated to Render
            const response = await axios.post(`${API_BASE_URL}/google-login`, {
                token: credentialResponse.credential
            });

            const { access_token, role } = response.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('role', role);
            localStorage.setItem('user_email', userEmail);

            // Navigate based on role
            if (role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/student');
            }

        } catch (err) {
            console.error(err);
            // Inga error message-ah konjam clear-ah kuduthurukkaen
            setError('Login Failed! Check your internet or Backend connectivity.');
        }
    };

    return (
        <div style={containerStyle}>
            <div style={loginBoxStyle}>
                <h1 style={{ color: '#1a73e8', marginBottom: '10px' }}>VouchTrack</h1>
                <h3 style={{ color: '#5f6368', fontWeight: 'normal' }}>Welcome back!</h3>
                <p style={{ color: '#70757a', fontSize: '14px', marginBottom: '30px' }}>
                    Sign in with your Karunya Education Account
                </p>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Login Failed')}
                        useOneTap
                    />
                </div>

                {error && (
                    <p style={{ color: '#d93025', backgroundColor: '#fce8e6', padding: '10px', borderRadius: '5px', marginTop: '20px', fontSize: '14px' }}>
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
};

const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f8f9fa'
};

const loginBoxStyle = {
    padding: '40px',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    textAlign: 'center',
    width: '380px',
    boxSizing: 'border-box'
};

export default Login;