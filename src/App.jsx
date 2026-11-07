import { Routes, Route, Navigate } from 'react-router-dom';
//other imports
import ProtectedRoute from './ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import ProjectDetail from './pages/ProjectDetail';

export default function App() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Auth Page */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Project / Studio Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
      </Route>

      {/* Catch-all fallback back to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}