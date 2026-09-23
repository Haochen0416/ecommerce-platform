import { useState, useEffect } from 'react';
import { productAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const { role } = useAuth();

  useEffect(() => {
    productAPI.list(category)
      .then(res => setProducts(res.data))
      .finally(() => setLoading(false));
  }, [category]);

  const addToCart = (product) => {
    setCart(prev => ({
      ...prev,
      [product.id]: { ...product, quantity: (prev[product.id]?.quantity || 0) + 1 }
    }));
  };

  const cartCount = Object.values(cart).reduce((sum, i) => sum + i.quantity, 0);

  const categories = ['', 'Electronics', 'Clothing', 'Books', 'Home'];

  if (loading) return <div style={styles.center}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Products</h2>
        <div style={styles.filters}>
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              style={{...styles.filterBtn, ...(category === c ? styles.activeFilter : {})}}>
              {c || 'All'}
            </button>
          ))}
        </div>
        {cartCount > 0 && (
          <button style={styles.cartBtn}
            onClick={() => { localStorage.setItem('cart', JSON.stringify(cart)); window.location.href='/cart'; }}>
            Cart ({cartCount})
          </button>
        )}
      </div>

      <div style={styles.grid}>
        {products.map(p => (
          <div key={p.id} style={styles.card}>
            <div style={styles.category}>{p.category}</div>
            <h3 style={styles.name}>{p.name}</h3>
            <p style={styles.desc}>{p.description}</p>
            <div style={styles.footer}>
              <span style={styles.price}>${parseFloat(p.price).toFixed(2)}</span>
              <span style={styles.stock}>Stock: {p.stock}</span>
            </div>
            {p.stock > 0 ? (
              <button style={styles.addBtn} onClick={() => addToCart(p)}>
                Add to Cart {cart[p.id] ? `(${cart[p.id].quantity})` : ''}
              </button>
            ) : (
              <button style={{...styles.addBtn, background:'#ccc'}} disabled>Out of Stock</button>
            )}
            {role === 'admin' && (
              <button style={styles.deleteBtn} onClick={async () => {
                await productAPI.delete(p.id);
                setProducts(products.filter(x => x.id !== p.id));
              }}>Delete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding:'24px', maxWidth:'1200px', margin:'0 auto' },
  center: { textAlign:'center', padding:'40px' },
  header: { display:'flex', alignItems:'center', gap:'16px', marginBottom:'24px', flexWrap:'wrap' },
  filters: { display:'flex', gap:'8px', flexWrap:'wrap' },
  filterBtn: { padding:'6px 14px', border:'1px solid #ddd', borderRadius:'20px', cursor:'pointer', background:'#fff' },
  activeFilter: { background:'#1a1a2e', color:'#fff', border:'1px solid #1a1a2e' },
  cartBtn: { marginLeft:'auto', padding:'8px 20px', background:'#e94560', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:'20px' },
  card: { background:'#fff', borderRadius:'8px', padding:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  category: { fontSize:'12px', color:'#888', marginBottom:'8px', textTransform:'uppercase' },
  name: { margin:'0 0 8px', color:'#1a1a2e' },
  desc: { fontSize:'13px', color:'#666', marginBottom:'12px', minHeight:'40px' },
  footer: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' },
  price: { fontWeight:'bold', fontSize:'18px', color:'#e94560' },
  stock: { fontSize:'12px', color:'#888' },
  addBtn: { width:'100%', padding:'8px', background:'#1a1a2e', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer', marginBottom:'6px' },
  deleteBtn: { width:'100%', padding:'6px', background:'#fee', color:'#c00', border:'1px solid #fcc', borderRadius:'4px', cursor:'pointer', fontSize:'13px' },
};
