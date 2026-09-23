import { useState, useEffect } from 'react';
import { orderAPI, productAPI } from '../api/client';

const STATUS_COLORS = {
  pending: '#f59e0b',
  paid: '#3b82f6',
  shipped: '#8b5cf6',
  completed: '#10b981',
  cancelled: '#ef4444',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([orderAPI.list(), productAPI.list()])
      .then(([ordersRes, productsRes]) => {
        setOrders(ordersRes.data);
        const map = {};
        productsRes.data.forEach(p => { map[p.id] = p.name; });
        setProducts(map);
      })
      .finally(() => setLoading(false));
  }, []);

  const cancelOrder = async (id) => {
    await orderAPI.updateStatus(id, 'cancelled');
    setOrders(orders.map(o => o.id === id ? {...o, status: 'cancelled'} : o));
  };

  if (loading) return <div style={styles.center}>Loading...</div>;
  if (orders.length === 0) return <div style={styles.center}><h2>No orders yet</h2></div>;

  return (
    <div style={styles.container}>
      <h2>My Orders</h2>
      {orders.map(order => (
        <div key={order.id} style={styles.card}>
          <div style={styles.header}>
            <span style={styles.id}>Order #{order.id}</span>
            <span style={{...styles.status, background: STATUS_COLORS[order.status] || '#888'}}>
              {order.status.toUpperCase()}
            </span>
            <span style={styles.date}>{new Date(order.created_at).toLocaleDateString()}</span>
          </div>
          <div style={styles.items}>
            {order.items.map(item => (
              <div key={item.id} style={styles.item}>
                <span>{products[item.product_id] || `Product #${item.product_id}`}</span>
                <span>x{item.quantity}</span>
                <span>${parseFloat(item.unit_price).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={styles.footer}>
            <span style={styles.total}>Total: <strong>${parseFloat(order.total_amount).toFixed(2)}</strong></span>
            {order.status === 'pending' && (
              <button style={styles.cancelBtn} onClick={() => cancelOrder(order.id)}>
                Cancel Order
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: { padding:'24px', maxWidth:'800px', margin:'0 auto' },
  center: { textAlign:'center', padding:'80px' },
  card: { background:'#fff', borderRadius:'8px', padding:'20px', marginBottom:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  header: { display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' },
  id: { fontWeight:'bold', color:'#1a1a2e', fontSize:'16px' },
  status: { padding:'3px 10px', borderRadius:'12px', color:'#fff', fontSize:'12px', fontWeight:'bold' },
  date: { marginLeft:'auto', color:'#888', fontSize:'13px' },
  items: { borderTop:'1px solid #f0f0f0', paddingTop:'12px' },
  item: { display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:'14px', color:'#555' },
  footer: { borderTop:'1px solid #f0f0f0', paddingTop:'12px', marginTop:'8px', display:'flex', justifyContent:'space-between', alignItems:'center' },
  total: { fontSize:'16px' },
  cancelBtn: { padding:'6px 16px', background:'#fee', color:'#c00', border:'1px solid #fcc', borderRadius:'4px', cursor:'pointer', fontSize:'13px' },
};
