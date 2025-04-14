import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';
import {
    Container,
    Box,
    Typography,
    Button,
    Snackbar,
    Alert
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';

export const Home = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const getUser = async () => {
            try {
                const currentUser = await account.get();
                setUser(currentUser);
            } catch (error) {
                navigate('/signin');
            }
        };
        getUser();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await account.deleteSession('current');
            navigate('/');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Container maxWidth="xl" className="min-h-screen">
            <Box className="py-8">
                <div className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-2">
                        <DashboardIcon className="text-blue-500" style={{ fontSize: 40 }} />
                        <Typography variant="h4" className="font-bold text-gray-800">
                            Dashboard
                        </Typography>
                    </div>
                    <Button
                        variant="outlined"
                        onClick={handleLogout}
                        className="border-red-500 text-red-500 hover:bg-red-50"
                    >
                        Logout
                    </Button>
                </div>

                {error && (
                    <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
                        <Alert severity="error">{error}</Alert>
                    </Snackbar>
                )}

                {user && (
                    <Box className="p-6 bg-white rounded-xl shadow-lg">
                        <Typography variant="h5" className="mb-4 text-gray-700">
                            Welcome back, <span className="text-blue-500">{user.name}</span>
                        </Typography>
                        <div className="space-y-2">
                            <Typography variant="body1" className="text-gray-600">
                                Email: {user.email}
                            </Typography>
                            <Typography variant="body1" className="text-gray-600">
                                Account Created: {new Date(user.$createdAt).toLocaleDateString()}
                            </Typography>
                        </div>
                    </Box>
                )}

                {/* Add dashboard content here */}
                <div className="mt-8 p-6 bg-white rounded-xl shadow-lg">
                    <Typography variant="h6" className="text-gray-700 mb-4">
                        Quick Actions
                    </Typography>
                    <div className="flex gap-4">
                        <Button variant="contained">New QCM</Button>
                        <Button variant="outlined">View History</Button>
                    </div>
                </div>
            </Box>
        </Container>
    );
};