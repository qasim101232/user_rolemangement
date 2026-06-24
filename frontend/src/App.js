import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Profile from './components/Profile';
import Settings from './components/Settings';
import ActivityLog from './components/ActivityLog';
import api from './utils/api';
import { ThemeProvider } from './context/ThemeContext';
import './styles/App.css';

function AppContent() {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Handle login
  const handleLogin = useCallback((userData) => {
    console.log('🔐 App: Login callback received:', userData);
    setUser(userData);
    setCurrentPage('dashboard');
    console.log('✅ App: User state updated');
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('dashboard');
  }, []);

  // Handle navigation
  const handleNavigate = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      try {
        console.log('🔍 Bootstrapping authentication...');
        
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        console.log('📦 Token exists:', !!token);
        console.log('📦 Saved user exists:', !!savedUser);

        if (!token) {
          console.log('❌ No token found, showing login');
          if (isMounted) {
            setUser(null);
            setBooting(false);
          }
          return;
        }

        // Check if we have saved user
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            if (isMounted) {
              console.log('✅ Using saved user:', parsedUser);
              setUser(parsedUser);
              setBooting(false);
              // Don't return, still verify with server
            }
          } catch (e) {
            console.warn('⚠️ Failed to parse saved user');
          }
        }

        // Verify with server
        try {
          console.log('🔍 Verifying token with server...');
          const response = await api.get('/auth/me');
          console.log('📥 Server response:', response.data);
          
          if (isMounted && response.data?.success && response.data.user) {
            console.log('✅ Server verified user:', response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setUser(response.data.user);
          } else {
            console.warn('❌ Server rejected token');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (isMounted) setUser(null);
          }
        } catch (serverError) {
          console.warn('❌ Server verification failed:', serverError);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (isMounted) setUser(null);
        }
      } catch (error) {
        console.error('❌ Bootstrap error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) {
          console.log('🏁 Bootstrap complete, booting:', false);
          setBooting(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Debug: Log user state changes
  useEffect(() => {
    console.log('👤 User state changed:', user);
  }, [user]);

  if (booting) {
    console.log('⏳ Still booting...');
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Loading session...</p>
      </div>
    );
  }

  if (!user) {
    console.log('👤 No user, rendering Login');
    return <Login onLogin={handleLogin} />;
  }

  console.log('👤 User logged in, rendering Dashboard');

  // Render pages
  const renderPage = () => {
    switch (currentPage) {
      case 'profile':
        return <Profile user={user} onBack={() => handleNavigate('dashboard')} />;
      case 'settings':
        return <Settings onBack={() => handleNavigate('dashboard')} />;
      case 'activity':
        return <ActivityLog onBack={() => handleNavigate('dashboard')} />;
      case 'dashboard':
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="app-container">
      <Header
        user={user}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;