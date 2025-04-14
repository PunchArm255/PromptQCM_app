import { Link } from 'react-router-dom';
import { Button, Typography, Box, Container } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';

export const Welcome = () => {
    return (
        <Container maxWidth="xl" className="min-h-screen flex items-center justify-center">
            <Box className="text-center space-y-8 max-w-4xl">
                <QuizIcon sx={{ fontSize: 80, color: 'primary.main' }} />
                <Typography variant="h2" className="font-bold text-gray-800">
                    AI-Powered QCM Generator
                </Typography>
                <Typography variant="h5" className="text-gray-600">
                    Transform educational content into interactive quizzes with intelligent automation
                </Typography>

                <div className="flex gap-4 justify-center mt-8">
                    <Button
                        component={Link}
                        to="/signin"
                        variant="contained"
                        size="large"
                        className="px-8 py-3 text-lg"
                    >
                        Sign In
                    </Button>
                    <Button
                        component={Link}
                        to="/signup"
                        variant="outlined"
                        size="large"
                        className="px-8 py-3 text-lg"
                    >
                        Sign Up
                    </Button>
                </div>
            </Box>
        </Container>
    );
};