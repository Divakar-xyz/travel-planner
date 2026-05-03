import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TripProvider } from './context/TripContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TripsPage from './pages/TripsPage';
import TripDetailPage from './pages/TripDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import CreateTripModal from './components/trip/CreateTripModal';
import { useNotifications } from './hooks/useNotifications';
import { ToastContainer } from './components/ui/Toast';
import Spinner from './components/ui/Spinner';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)' }}>
      <Spinner size={40}/>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

const NewTripPage = () => {
  const [open, setOpen] = React.useState(true);
  return (
    <CreateTripModal 
      isOpen={open} 
      onClose={() => { setOpen(false); window.history.back(); }}
      onSuccess={(trip) => { window.location.href = `/trips/${trip._id}`; }} 
    />
  );
};
const AppContent = () => {
  const { notifications, dismiss } = useNotifications();
  return (
    <>
      <ToastContainer notifications={notifications} onDismiss={dismiss}/>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage/></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage/></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><TripProvider><AppLayout/></TripProvider></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace/>}/>
            <Route path="dashboard" element={<DashboardPage/>}/>
            <Route path="trips" element={<TripsPage/>}/>
            <Route path="trips/new" element={<><TripsPage/><NewTripPage/></>}/>
            <Route path="trips/:id" element={<TripDetailPage/>}/>
            <Route path="analytics" element={<AnalyticsPage/>}/>
            <Route path="profile" element={<ProfilePage/>}/>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
        </Routes>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent/>
  </AuthProvider>
);
export default App;
