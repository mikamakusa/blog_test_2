import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
const dotenv = require('dotenv');

dotenv.config();

const AUTH_URI = process.env.AUTH_URI || 'localhost:5000';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            verifyToken(token);
        } else {
            setLoading(false);
        }
    }, []);

    const verifyToken = async (token) => {
        try {
            const response = await axios.get(`http://${AUTH_URI}/auth/verify`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data.user);
        } catch (error) {
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            console.log('Attempting login with:', { email, password: '***' });
            
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            const response = await axios.post(`http://${AUTH_URI}/auth/login`, {
                email: email.trim(),
                password: password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Login response:', { ...response.data, token: 'hidden' });
            
            const { token, user } = response.data;
            if (!token || !user) {
                throw new Error('Invalid response from server');
            }

            localStorage.setItem('token', token);
            setUser(user);
            return true;
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            throw error.response?.data?.message || error.message || 'Login failed';
        }
    };

    const register = async (email, password, name) => {
        try {
            const response = await axios.post(`http://${AUTH_URI}/auth/register`, {
                email,
                password,
                name
            });
            const { token } = response.data;
            localStorage.setItem('token', token);
            await verifyToken(token);
            return true;
        } catch (error) {
            throw error.response?.data?.message || 'Registration failed';
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const googleLogin = () => {
        window.location.href = `http://${AUTH_URI}/auth/google`;
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        googleLogin
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 