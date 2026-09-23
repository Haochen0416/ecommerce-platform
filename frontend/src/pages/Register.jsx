import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/client';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.register(form);
      navigate('/login');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail[0].msg : detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Register</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} placeholder="Username"
            value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
          <input style={styles.input} placeholder="Email"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input style={styles.input} type="password" placeholder="Password (min 8 chars)"
            value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={styles.footer}>Have an account? <Link to="/login">Login</Link></p>
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
