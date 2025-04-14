import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    Snackbar
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';

export const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        try {
            await account.createEmailPasswordSession(email, password);
            navigate('/home');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Container maxWidth="sm" className="min-h-screen flex items-center">
            <Box className="w-full p-8 bg-white rounded-xl shadow-lg">
                <div className="text-center mb-8">
                    <LockOpenIcon className="text-blue-500 mb-4" style={{ fontSize: 50 }} />
                    <Typography variant="h4" className="font-bold text-gray-800">
                        Welcome Back
                    </Typography>
                </div>

                {error && (
                    <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
                        <Alert severity="error">{error}</Alert>
                    </Snackbar>
                )}

                <form onSubmit={handleSignIn} className="space-y-6">
                    <TextField
                        fullWidth
                        label="Email Address"
                        variant="outlined"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mb-4"
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        variant="outlined"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mb-6"
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        type="submit"
                        className="py-3 text-lg"
                    >
                        Sign In
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Typography variant="body2" className="text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-500 hover:underline">
                            Create one
                        </Link>
                    </Typography>
                </div>
            </Box>
        </Container>
    );
};