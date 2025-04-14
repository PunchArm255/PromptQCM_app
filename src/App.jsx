import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Welcome } from './pages/Welcome';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Home } from './pages/Home';
import { account } from './lib/appwrite';
import { useState, useEffect } from 'react';

const theme = createTheme({
  palette: {
    primary: { main: '#3B82F6' },
    secondary: { main: '#6366F1' },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const user = await account.get();
        setUser(user);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    checkUserStatus();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  return user ? children : <Navigate to="/signin" />;
};