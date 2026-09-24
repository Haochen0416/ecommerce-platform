import { useState, useEffect } from 'react';
import { productAPI, orderAPI, adminAPI } from '../api/client';

const TABS = ['Products', 'Orders', 'Users', 'Audit Log'];

const STATUS_COLORS = {
  pending: '#f59e0b', paid: '#3b82f6', shipped: '#8b5cf6',
  completed: '#10b981', cancelled: '#ef4444',
};

export default function Admin() {
  const [tab, setTab] = useState('Products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({ name:'', description:'', price:'', stock:'', category:'' });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [msg, setMsg] = useState('');

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  useEffect(() => {
    setLoading(true);
    if (tab === 'Products') productAPI.list().then(r => setProducts(r.data)).finally(() => setLoading(false));
    if (tab === 'Orders') orderAPI.list().then(r => setOrders(r.data)).finally(() => setLoading(false));
    if (tab === 'Users') adminAPI.users().then(r => setUsers(r.data)).finally(() => setLoading(false));
    if (tab === 'Audit Log') adminAPI.auditLog().then(r => setAuditLog(r.data)).finally(() => setLoading(false));
  }, [tab]);

  const createProduct = async () => {
    if (!newProduct.name || !newProduct.price) return flash('Name and price are required');
    await productAPI.create({ ...newProduct, price: parseFloat(newProduct.price), stock: parseInt(newProduct.stock) || 0 });
    const r = await productAPI.list();
    setProducts(r.data);
    setNewProduct({ name:'', description:'', price:'', stock:'', category:'' });
    flash('Product created');
  };

  const saveEdit = async (id) => {
    await productAPI.update(id, { ...editData, price: parseFloat(editData.price), stock: parseInt(editData.stock) });
    const r = await productAPI.list();
    setProducts(r.data);
    setEditId(null);
    flash('Product updated');
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await productAPI.delete(id);
    setProducts(products.filter(p => p.id !== id));
    flash('Product deleted');
  };

  const updateStatus = async (id, status) => {
    await orderAPI.updateStatus(id, status);
    setOrders(orders.map(o => o.id === id ? {...o, status} : o));
    flash('Order status updated');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Admin Dashboard</h2>
      {msg && <div style={styles.flash}>{msg}</div>}

      <div style={styles.tabs}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{...styles.tab, ...(tab === t ? styles.activeTab : {})}}>
            {t}
          </button>
        ))}
      </div>

      {loading && <div style={styles.center}>Loading...</div>}

      {/* Products Tab */}
      {tab === 'Products' && !loading && (
        <div>
          <div style={styles.formCard}>
            <h3 style={styles.subheading}>Add New Product</h3>
            <div style={styles.formGrid}>
              {['name','description','price','stock','category'].map(field => (
                <input key={field} style={styles.input} placeholder={field.charAt(0).toUpperCase()+field.slice(1)}
                  value={newProduct[field]}
                  onChange={e => setNewProduct({...newProduct, [field]: e.target.value})} />
              ))}
            </div>
            <button style={styles.btnPrimary} onClick={createProduct}>Add Product</button>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>{['ID','Name','Category','Price','Stock','Actions'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={styles.tr}>
                  <td style={styles.td}>{p.id}</td>
                  <td style={styles.td}>
                    {editId === p.id
                      ? <input style={styles.inlineInput} value={editData.name}
                          onChange={e => setEditData({...editData, name: e.target.value})} />
                      : p.name}
                  </td>
                  <td style={styles.td}>
                    {editId === p.id
                      ? <input style={styles.inlineInput} value={editData.category}
                          onChange={e => setEditData({...editData, category: e.target.value})} />
                      : p.category}
                  </td>
                  <td style={styles.td}>
                    {editId === p.id
                      ? <input style={{...styles.inlineInput, width:'80px'}} value={editData.price}
                          onChange={e => setEditData({...editData, price: e.target.value})} />
                      : `$${parseFloat(p.price).toFixed(2)}`}
                  </td>
                  <td style={styles.td}>
                    {editId === p.id
                      ? <input style={{...styles.inlineInput, width:'60px'}} value={editData.stock}
                          onChange={e => setEditData({...editData, stock: e.target.value})} />
                      : p.stock}
                  </td>
                  <td style={styles.td}>
                    {editId === p.id ? (
                      <>
                        <button style={styles.btnSm} onClick={() => saveEdit(p.id)}>Save</button>
                        <button style={styles.btnSmGray} onClick={() => setEditId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button style={styles.btnSm} onClick={() => { setEditId(p.id); setEditData({name:p.name,category:p.category,price:p.price,stock:p.stock}); }}>Edit</button>
                        <button style={styles.btnSmRed} onClick={() => deleteProduct(p.id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Orders Tab */}
      {tab === 'Orders' && !loading && (
        <table style={styles.table}>
          <thead>
            <tr>{['ID','User','Total','Status','Date','Action'].map(h => (
              <th key={h} style={styles.th}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={styles.tr}>
                <td style={styles.td}>#{o.id}</td>
                <td style={styles.td}>User #{o.user_id}</td>
                <td style={styles.td}>${parseFloat(o.total_amount).toFixed(2)}</td>
                <td style={styles.td}>
                  <span style={{...styles.badge, background: STATUS_COLORS[o.status] || '#888'}}>
                    {o.status.toUpperCase()}
                  </span>
                </td>
                <td style={styles.td}>{new Date(o.created_at).toLocaleDateString()}</td>
                <td style={styles.td}>
                  <select style={styles.select} value={o.status}
                    onChange={e => updateStatus(o.id, e.target.value)}>
                    {['pending','paid','shipped','completed','cancelled'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Users Tab */}
      {tab === 'Users' && !loading && (
        <table style={styles.table}>
          <thead>
            <tr>{['ID','Username','Email','Role','Joined'].map(h => (
              <th key={h} style={styles.th}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={styles.tr}>
                <td style={styles.td}>{u.id}</td>
                <td style={styles.td}>{u.username}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>
                  <span style={{...styles.badge, background: u.role === 'admin' ? '#e94560' : '#3b82f6'}}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td style={styles.td}>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Audit Log Tab */}
      {tab === 'Audit Log' && !loading && (
        <table style={styles.table}>
          <thead>
            <tr>{['ID','User','Action','Table','Record','Detail','Time'].map(h => (
              <th key={h} style={styles.th}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {auditLog.map(log => (
              <tr key={log.id} style={styles.tr}>
                <td style={styles.td}>{log.id}</td>
                <td style={styles.td}>#{log.user_id}</td>
                <td style={styles.td}><code>{log.action}</code></td>
                <td style={styles.td}>{log.table_name}</td>
                <td style={styles.td}>{log.record_id}</td>
                <td style={styles.td}>{log.detail}</td>
                <td style={styles.td}>{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: { padding:'24px', maxWidth:'1200px', margin:'0 auto' },
  heading: { color:'#1a1a2e', marginBottom:'16px' },
  subheading: { margin:'0 0 12px', color:'#1a1a2e', fontSize:'15px' },
  flash: { background:'#d1fae5', color:'#065f46', padding:'10px 16px', borderRadius:'6px', marginBottom:'16px', fontSize:'14px' },
  tabs: { display:'flex', gap:'8px', marginBottom:'24px', borderBottom:'2px solid #f0f0f0', paddingBottom:'0' },
  tab: { padding:'10px 20px', border:'none', background:'none', cursor:'pointer', fontSize:'14px', color:'#888', borderBottom:'2px solid transparent', marginBottom:'-2px' },
  activeTab: { color:'#1a1a2e', fontWeight:'bold', borderBottom:'2px solid #e94560' },
  center: { textAlign:'center', padding:'40px', color:'#888' },
  formCard: { background:'#f8f8f8', padding:'20px', borderRadius:'8px', marginBottom:'24px' },
  formGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'10px', marginBottom:'12px' },
  input: { padding:'8px 10px', border:'1px solid #ddd', borderRadius:'4px', fontSize:'13px', width:'100%', boxSizing:'border-box' },
  inlineInput: { padding:'4px 8px', border:'1px solid #ddd', borderRadius:'4px', fontSize:'13px', width:'120px' },
  table: { width:'100%', borderCollapse:'collapse', background:'#fff', borderRadius:'8px', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  th: { padding:'12px 14px', background:'#f8f8f8', textAlign:'left', fontSize:'12px', color:'#888', fontWeight:'600', textTransform:'uppercase' },
  tr: { borderBottom:'1px solid #f0f0f0' },
  td: { padding:'12px 14px', fontSize:'13px', color:'#333' },
  badge: { padding:'2px 8px', borderRadius:'10px', color:'#fff', fontSize:'11px', fontWeight:'bold' },
  select: { padding:'4px 8px', border:'1px solid #ddd', borderRadius:'4px', fontSize:'12px', cursor:'pointer' },
  btnPrimary: { padding:'8px 20px', background:'#1a1a2e', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer', fontSize:'13px' },
  btnSm: { padding:'4px 10px', background:'#1a1a2e', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer', fontSize:'12px', marginRight:'6px' },
  btnSmGray: { padding:'4px 10px', background:'#888', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer', fontSize:'12px' },
  btnSmRed: { padding:'4px 10px', background:'#ef4444', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer', fontSize:'12px' },
};
