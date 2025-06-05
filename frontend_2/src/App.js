import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import AuthCallback from './components/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import UserManagement from './components/UserManagement';
import PostManagement from './components/PostManagement';
import AdminDashboard from './components/AdminDashboard';
import BlogHome from './components/BlogHome';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    return (
        <AuthProvider>
            <ThemeProvider theme={theme}>
                <Router>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<BlogHome />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />

                        {/* Protected admin routes */}
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/users"
                            element={
                                <ProtectedRoute>
                                    <UserManagement />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/posts"
                            element={
                                <ProtectedRoute>
                                    <PostManagement />
                                </ProtectedRoute>
                            }
                        />

                        {/* Catch all route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
