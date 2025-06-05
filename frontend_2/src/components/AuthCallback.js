import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyToken } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            localStorage.setItem('token', token);
            verifyToken(token);
            navigate('/admin');
        } else {
            navigate('/login');
        }
    }, [location, navigate, verifyToken]);

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh' 
        }}>
            Processing authentication...
        </div>
    );
};

export default AuthCallback; 