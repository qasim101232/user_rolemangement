// import React, { useEffect, useMemo, useState, useCallback } from 'react';
// import Login from './components/Login';
// import Dashboard from './components/Dashboard';
// import Header from './components/Header';
// import Profile from './components/Profile';
// import Settings from './components/Settings';
// import ActivityLog from './components/ActivityLog';
// import api from './utils/api';
// import { ThemeProvider } from './context/ThemeContext';
// import './styles/App.css';

// function AppContent() {
//   const [user, setUser] = useState(null);
//   const [booting, setBooting] = useState(true);
//   const [currentPage, setCurrentPage] = useState('dashboard');
//   const [authError, setAuthError] = useState(null);

//   const token = useMemo(() => {
//     try {
//       return localStorage.getItem('token');
//     } catch {
//       return null;
//     }
//   }, []);

//   // Use useCallback to prevent unnecessary re-renders
//   const handleLogin = useCallback((userData) => {
//     console.log('Login successful, setting user:', userData);
//     setUser(userData);
//     setCurrentPage('dashboard');
//     setAuthError(null);
//   }, []);

//   const handleLogout = useCallback(() => {
//     try {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//     } catch {
//       // ignore
//     }
//     setUser(null);
//     setCurrentPage('dashboard');
//     setAuthError(null);
//   }, []);

//   const handleNavigate = useCallback((page) => {
//     setCurrentPage(page);
//   }, []);

//   useEffect(() => {
//     let isMounted = true;

//     const bootstrapAuth = async () => {
//       try {
//         setBooting(true);
//         setAuthError(null);

//         const savedToken = localStorage.getItem('token');
//         const savedUser = localStorage.getItem('user');

//         // If no token, skip authentication
//         if (!savedToken) {
//           if (isMounted) {
//             setUser(null);
//             setBooting(false);
//           }
//           return;
//         }

//         // Try to parse saved user first
//         let parsedUser = null;
//         if (savedUser) {
//           try {
//             parsedUser = JSON.parse(savedUser);
//             if (parsedUser && isMounted) {
//               setUser(parsedUser);
//             }
//           } catch (parseError) {
//             console.warn('Failed to parse saved user:', parseError);
//             // Continue to fetch from server
//           }
//         }

//         // Always verify with server to ensure token is still valid
//         try {
//           const meRes = await api.get('/auth/me', {
//             headers: {
//               Authorization: `Bearer ${savedToken}`
//             }
//           });

//           if (isMounted && meRes.data?.success && meRes.data.user) {
//             // Update user data from server
//             const userData = meRes.data.user;
//             localStorage.setItem('user', JSON.stringify(userData));
//             setUser(userData);
//           } else {
//             // Server response indicates invalid token
//             throw new Error('Invalid session');
//           }
//         } catch (serverError) {
//           console.warn('Server validation failed, clearing session:', serverError);
//           // Token is invalid, clear everything
//           localStorage.removeItem('token');
//           localStorage.removeItem('user');
//           if (isMounted) {
//             setUser(null);
//           }
//         }
//       } catch (error) {
//         console.error('Auth bootstrap error:', error);
//         // Clear any corrupted data
//         try {
//           localStorage.removeItem('token');
//           localStorage.removeItem('user');
//         } catch {
//           // ignore
//         }
//         if (isMounted) {
//           setUser(null);
//           setAuthError('Session expired. Please login again.');
//         }
//       } finally {
//         if (isMounted) {
//           setBooting(false);
//         }
//       }
//     };

//     bootstrapAuth();
    
//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   // Show loading state
//   if (booting) {
//     return (
//       <div className="loading-container">
//         <div className="spinner-large"></div>
//         <p>Loading session...</p>
//       </div>
//     );
//   }

//   // Show error if any
//   if (authError) {
//     return (
//       <div className="error-container">
//         <div className="error-box">
//           <h3>Authentication Error</h3>
//           <p>{authError}</p>
//           <button onClick={() => {
//             setAuthError(null);
//             localStorage.removeItem('token');
//             localStorage.removeItem('user');
//             setUser(null);
//           }} className="btn-primary">
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Show login if no user
//   if (!user) {
//     return <Login onLogin={handleLogin} />;
//   }

//   // Render different pages based on currentPage
//   const renderPage = () => {
//     switch (currentPage) {
//       case 'profile':
//         return <Profile user={user} onBack={() => handleNavigate('dashboard')} />;
//       case 'settings':
//         return <Settings onBack={() => handleNavigate('dashboard')} />;
//       case 'activity':
//         return <ActivityLog onBack={() => handleNavigate('dashboard')} />;
//       case 'dashboard':
//       default:
//         return <Dashboard user={user} />;
//     }
//   };

//   return (
//     <div className="app-container">
//       <Header 
//         user={user} 
//         onLogout={handleLogout}
//         onNavigate={handleNavigate}
//         currentPage={currentPage}
//       />
//       <main className="main-content">
//         {renderPage()}
//       </main>
//     </div>
//   );
// }

// function App() {
//   return (
//     <ThemeProvider>
//       <AppContent />
//     </ThemeProvider>
//   );
// }

// export default App;