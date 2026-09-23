import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const updateQty = (id, delta) => {
    setCart(prev => {
      const item = prev[id];
      const qty = item.quantity + delta;
      if (qty <= 0) {
        const { [id]: _, ...rest } = prev;
        localStorage.setItem('cart', JSON.stringify(rest));
        return rest;
      }
      const updated = { ...prev, [id]: { ...item, quantity: qty } };
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  const total = Object.values(cart).reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);

  const checkout = async () => {
    if (!user) return navigate('/login');
    setLoading(true);
    setError('');
    try {
      const items = Object.values(cart).map(i => ({ product_id: i.id, quantity: i.quantity }));
      await orderAPI.create(items);
      localStorage.removeItem('cart');
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.detail || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const items = Object.values(cart);

  if (items.length === 0) return (
    <div style={styles.empty}>
      <h2>Your cart is empty</h2>
      <button style={styles.btn} onClick={() => navigate('/products')}>Browse Products</button>
    </div>
  );

  return (
    <div style={styles.container}>
      <h2>Shopping Cart</h2>
      {error && <div style={styles.error}>{error}</div>}
      {items.map(item => (
        <div key={item.id} style={styles.item}>
          <div>
            <div style={styles.name}>{item.name}</div>
            <div style={styles.price}>${parseFloat(item.price).toFixed(2)} each</div>
          </div>
          <div style={styles.qty}>
            <button style={styles.qtyBtn} onClick={() => updateQty(item.id, -1)}>-</button>
            <span style={styles.qtyNum}>{item.quantity}</span>
            <button style={styles.qtyBtn} onClick={() => updateQty(item.id, 1)}>+</button>
          </div>
          <div style={styles.subtotal}>${(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
        </div>
      ))}
      <div style={styles.total}>
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
      <button style={styles.checkout} onClick={checkout} disabled={loading}>
        {loading ? 'Processing...' : 'Place Order'}
      </button>
    </div>
  );
}

const styles = {
  container: { padding:'24px', maxWidth:'700px', margin:'0 auto' },
  empty: { textAlign:'center', padding:'80px' },
  error: { background:'#fee', color:'#c00', padding:'10px', borderRadius:'4px', marginBottom:'16px' },
  item: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px', background:'#fff', borderRadius:'8px', marginBottom:'12px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  name: { fontWeight:'bold', color:'#1a1a2e' },
  price: { fontSize:'13px', color:'#888', marginTop:'4px' },
  qty: { display:'flex', alignItems:'center', gap:'12px' },
  qtyBtn: { width:'28px', height:'28px', border:'1px solid #ddd', borderRadius:'4px', cursor:'pointer', background:'#f5f5f5', fontSize:'16px' },
  qtyNum: { fontWeight:'bold', minWidth:'20px', textAlign:'center' },
  subtotal: { fontWeight:'bold', color:'#e94560', minWidth:'80px', textAlign:'right' },
  total: { display:'flex', justifyContent:'space-between', padding:'16px', fontWeight:'bold', fontSize:'18px', borderTop:'2px solid #eee', marginTop:'8px' },
  checkout: { width:'100%', padding:'14px', background:'#e94560', color:'#fff', border:'none', borderRadius:'4px', fontSize:'16px', cursor:'pointer', marginTop:'16px' },
  btn: { padding:'10px 24px', background:'#1a1a2e', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer', marginTop:'16px' },
};
