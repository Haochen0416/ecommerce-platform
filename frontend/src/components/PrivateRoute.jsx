import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div style={{textAlign:'center',padding:'40px'}}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && role !== 'admin') return <Navigate to="/" />;
  return children;
}
