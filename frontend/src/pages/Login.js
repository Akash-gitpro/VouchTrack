import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

            // Backend Login Call
            const response = await axios.post('http://127.0.0.1:8000/google-login', {
                token: credentialResponse.credential
            });

            // Inga needs_registration check-ah thookittaen, 
            // yename details ellam Slot Booking appo dhaan update aagum.
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
            setError('Login Failed! Backend connection error.');
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
    width: '380px'
};

export default Login;