import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    Snackbar,
    Alert
} from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';

export const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            await account.create('unique()', email, password, name);
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
                    <HowToRegIcon className="text-blue-500 mb-4" style={{ fontSize: 50 }} />
                    <Typography variant="h4" className="font-bold text-gray-800">
                        Create Account
                    </Typography>
                </div>

                {error && (
                    <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
                        <Alert severity="error">{error}</Alert>
                    </Snackbar>
                )}

                <form onSubmit={handleSignUp} className="space-y-6">
                    <TextField
                        fullWidth
                        label="Full Name"
                        variant="outlined"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Email Address"
                        variant="outlined"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        variant="outlined"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        type="submit"
                        className="py-3 text-lg"
                    >
                        Sign Up
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Typography variant="body2" className="text-gray-600">
                        Already have an account?{' '}
                        <Link to="/signin" className="text-blue-500 hover:underline">
                            Sign In
                        </Link>
                    </Typography>
                </div>
            </Box>
        </Container>
    );
};