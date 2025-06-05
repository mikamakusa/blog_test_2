import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Button,
    TextField,
    Box,
    Typography,
    Container,
    Paper,
    Divider,
    Link
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const { login, register, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isRegister) {
                await register(email, password, name);
            } else {
                await login(email, password);
            }
            navigate('/admin');
        } catch (error) {
            setError(error.toString());
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
                <Typography component="h1" variant="h5" align="center" gutterBottom>
                    {isRegister ? 'Register' : 'Sign In'}
                </Typography>
                {error && (
                    <Typography color="error" align="center" gutterBottom>
                        {error}
                    </Typography>
                )}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    {isRegister && (
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="name"
                            label="Full Name"
                            name="name"
                            autoComplete="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    )}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete={isRegister ? "new-password" : "current-password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {isRegister ? 'Register' : 'Sign In'}
                    </Button>
                    <Divider sx={{ my: 2 }}>OR</Divider>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<GoogleIcon />}
                        onClick={googleLogin}
                        sx={{ mt: 1 }}
                    >
                        Sign in with Google
                    </Button>
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Link
                            component="button"
                            variant="body2"
                            onClick={() => setIsRegister(!isRegister)}
                        >
                            {isRegister
                                ? 'Already have an account? Sign in'
                                : "Don't have an account? Register"}
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login; 