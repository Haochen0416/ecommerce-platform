import { useState, useEffect } from 'react';
import { productAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

const getImageUrl = (name, category) => {
  const keywords = {
    'iPhone 15': 'iphone',
    'iPhone 18': 'iphone',
    'MacBook Pro 14': 'macbook',
    'AirPods Pro': 'airpods,earbuds',
    'Nike Air Max': 'nike,sneakers',
    'Python Crash Course': 'programming,book',
    'Coffee Maker': 'coffee,maker',
  };
  const fallback = {
    'Electronics': 'electronics,gadget',
    'Clothing': 'fashion,clothing',
    'Books': 'book,reading',
    'Home': 'home,kitchen',
    'Sports': 'sports',
    'Beauty': 'beauty,cosmetics',
  };
  const kw = keywords[name] || fallback[category] || 'product';
  return `https://source.unsplash.com/300x200/?${kw}`;
};

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
        <h2 style={styles.title}>Products</h2>
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
            🛒 Cart ({cartCount})
          </button>
        )}
      </div>

      <div style={styles.grid}>
        {products.map(p => (
          <div key={p.id} style={styles.card}>
            <div style={styles.imageWrapper}>
              <img
                src={getImageUrl(p.name, p.category)}
                alt={p.name}
                style={styles.image}
                onError={e => { e.target.style.display='none'; }}
              />
            </div>
            <div style={styles.body}>
              <div style={styles.category}>{p.category}</div>
              <h3 style={styles.name}>{p.name}</h3>
              <p style={styles.desc}>{p.description}</p>
              <div style={styles.priceRow}>
                <span style={styles.price}>${parseFloat(p.price).toFixed(2)}</span>
                <span style={p.stock > 0 ? styles.inStock : styles.outStock}>
                  {p.stock > 0 ? `Stock: ${p.stock}` : 'Out of Stock'}
                </span>
              </div>
              {p.stock > 0 ? (
                <button style={styles.addBtn} onClick={() => addToCart(p)}>
                  Add to Cart {cart[p.id] ? `(${cart[p.id].quantity})` : ''}
                </button>
              ) : (
                <button style={{...styles.addBtn, ...styles.disabledBtn}} disabled>
                  Out of Stock
                </button>
              )}
              {role === 'admin' && (
                <button style={styles.deleteBtn} onClick={async () => {
                  await productAPI.delete(p.id);
                  setProducts(products.filter(x => x.id !== p.id));
                }}>Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding:'24px', maxWidth:'1200px', margin:'0 auto', background:'#fff', minHeight:'100vh' },
  center: { textAlign:'center', padding:'40px' },
  header: { display:'flex', alignItems:'center', gap:'16px', marginBottom:'28px', flexWrap:'wrap' },
  title: { margin:0, fontSize:'24px', color:'#1a1a2e' },
  filters: { display:'flex', gap:'8px', flexWrap:'wrap' },
  filterBtn: { padding:'6px 16px', border:'1px solid #ddd', borderRadius:'20px', cursor:'pointer', background:'#fff', fontSize:'13px' },
  activeFilter: { background:'#1a1a2e', color:'#fff', border:'1px solid #1a1a2e' },
  cartBtn: { marginLeft:'auto', padding:'8px 20px', background:'#e94560', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'bold' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:'24px' },
  card: { background:'#fff', borderRadius:'12px', overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.08)', border:'1px solid #f0f0f0' },
  imageWrapper: { width:'100%', height:'180px', overflow:'hidden', background:'#f8f8f8' },
  image: { width:'100%', height:'100%', objectFit:'cover' },
  body: { padding:'16px' },
  category: { fontSize:'11px', color:'#888', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'1px' },
  name: { margin:'0 0 8px', color:'#1a1a2e', fontSize:'16px', fontWeight:'600' },
  desc: { fontSize:'13px', color:'#666', marginBottom:'12px', minHeight:'36px', lineHeight:'1.4' },
  priceRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' },
  price: { fontWeight:'bold', fontSize:'20px', color:'#e94560' },
  inStock: { fontSize:'12px', color:'#10b981' },
  outStock: { fontSize:'12px', color:'#ef4444' },
  addBtn: { width:'100%', padding:'10px', background:'#1a1a2e', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'14px', marginBottom:'6px', fontWeight:'500' },
  disabledBtn: { background:'#ccc', cursor:'not-allowed' },
  deleteBtn: { width:'100%', padding:'7px', background:'#fff', color:'#c00', border:'1px solid #fcc', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
};
