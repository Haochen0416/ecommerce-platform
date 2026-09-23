import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const role = await login(form.username, form.password);
      navigate(role === 'admin' ? '/admin' : '/products');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} placeholder="Username"
            value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
          <input style={styles.input} type="password" placeholder="Password"
            value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={styles.footer}>No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'80vh' },
  card: { background:'#fff', padding:'40px', borderRadius:'8px', boxShadow:'0 2px 16px rgba(0,0,0,0.1)', width:'360px' },
  title: { textAlign:'center', marginBottom:'24px', color:'#1a1a2e' },
  error: { background:'#fee', color:'#c00', padding:'10px', borderRadius:'4px', marginBottom:'16px', fontSize:'14px' },
  input: { width:'100%', padding:'10px', marginBottom:'14px', border:'1px solid #ddd', borderRadius:'4px', fontSize:'14px', boxSizing:'border-box' },
  btn: { width:'100%', padding:'12px', background:'#e94560', color:'#fff', border:'none', borderRadius:'4px', fontSize:'16px', cursor:'pointer' },
  footer: { textAlign:'center', marginTop:'16px', fontSize:'14px' },
};
