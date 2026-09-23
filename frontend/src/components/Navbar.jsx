import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>E-Commerce</Link>
      <div style={styles.links}>
        <Link to="/products" style={styles.link}>Products</Link>
        {user && <Link to="/cart" style={styles.link}>Cart</Link>}
        {user && <Link to="/orders" style={styles.link}>Orders</Link>}
        {role === 'admin' && <Link to="/admin" style={styles.link}>Admin</Link>}
        {user ? (
          <>
            <span style={styles.username}>{user.username}</span>
            <button onClick={handleLogout} style={styles.btn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: { display:'flex', justifyContent:'space-between', alignItems:'center',
    padding:'12px 24px', backgroundColor:'#1a1a2e', color:'#fff' },
  brand: { color:'#e94560', fontWeight:'bold', fontSize:'20px', textDecoration:'none' },
  links: { display:'flex', alignItems:'center', gap:'16px' },
  link: { color:'#fff', textDecoration:'none', fontSize:'14px' },
  username: { color:'#a8b2d8', fontSize:'14px' },
  btn: { background:'#e94560', color:'#fff', border:'none', padding:'6px 14px',
    borderRadius:'4px', cursor:'pointer', fontSize:'14px' },
};
