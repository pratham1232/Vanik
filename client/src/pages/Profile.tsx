import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { User, Package, Heart, Settings, LogOut, ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/api/orders/myorders');
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-2">
            <div className="p-6 rounded-3xl bg-surface border border-border mb-6 text-center">
              <div className="relative inline-block mb-4">
                <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border-2 border-primary" />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full border-2 border-surface flex items-center justify-center">
                  <Star size={10} className="text-white fill-white" />
                </div>
              </div>
              <h2 className="text-lg font-bold text-white">{user.name}</h2>
              <p className="text-xs text-muted font-medium mb-4">{user.email}</p>
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                {user.role} Member
              </span>
            </div>

            <button className="w-full flex items-center gap-3 px-6 py-4 bg-primary/10 text-primary border border-primary/20 rounded-2xl font-bold transition-all">
              <User size={18} /> Profile Details
            </button>
            <button className="w-full flex items-center gap-3 px-6 py-4 bg-transparent text-muted hover:text-white rounded-2xl font-bold transition-all group">
              <Package size={18} /> My Orders
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-all" />
            </button>
            <button className="w-full flex items-center gap-3 px-6 py-4 bg-transparent text-muted hover:text-white rounded-2xl font-bold transition-all group">
              <Heart size={18} /> Wishlist
            </button>
            <button className="w-full flex items-center gap-3 px-6 py-4 bg-transparent text-muted hover:text-white rounded-2xl font-bold transition-all group">
              <Settings size={18} /> Settings
            </button>
            <div className="h-px bg-border my-4" />
            <button onClick={logout} className="w-full flex items-center gap-3 px-6 py-4 bg-transparent text-accent rounded-2xl font-bold hover:bg-accent/5 transition-all">
              <LogOut size={18} /> Sign Out
            </button>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-8">Recent Orders</h1>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-32 bg-surface animate-pulse rounded-3xl border border-border" />)}
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 bg-surface/30 rounded-[3rem] border border-border border-dashed text-center">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-white mb-2">No orders yet</h3>
                <p className="text-muted mb-6">Your exclusive purchases will appear here.</p>
                <button onClick={() => navigate('/explore')} className="px-8 py-3 bg-primary text-white rounded-xl font-bold">
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={order._id} 
                    className="p-6 bg-surface border border-border rounded-3xl flex flex-col sm:flex-row items-center gap-6"
                  >
                    <div className="flex -space-x-4">
                      {order.items.slice(0, 3).map((item: any, i: number) => (
                        <img key={i} src={item.product.images[0]} className="w-16 h-16 rounded-xl border-2 border-surface object-cover shadow-xl" alt="" />
                      ))}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-bold text-white">Order #{order._id.slice(-8).toUpperCase()}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                          order.status === 'delivered' ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted mb-4">{new Date(order.createdAt).toLocaleDateString()} • {order.items.length} Items</p>
                      <div className="text-lg font-black text-white">₹{order.totalAmount.toLocaleString('en-IN')}</div>
                    </div>
                    <button className="w-full sm:w-auto px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-sm hover:bg-white/10 transition-all">
                      View Receipt
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
