import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { LayoutDashboard, ShoppingBag, Users, IndianRupee, Plus, Trash2, Edit3, TrendingUp, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, orderRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/orders') // This requires admin route
        ]);
        
        setProducts(prodRes.data);
        
        // Calculate stats from orders (mocking for now if orders are empty)
        const orders = orderRes.data || [];
        setStats({
          totalSales: orders.reduce((acc, curr) => acc + curr.totalAmount, 0),
          totalOrders: orders.length,
          totalUsers: 42, // Mock
          totalProducts: prodRes.data.length
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const deleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${id}`);
        setProducts(products.filter((p: any) => p._id !== id));
        toast.success('Product deleted');
      } catch (err) {
        toast.error('Failed to delete product');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Admin Control</h1>
            <p className="text-muted font-medium uppercase tracking-widest text-[10px]">Managing Vanik Premium Ecosystem</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/30 hover:scale-105 transition-all">
            <Plus size={20} /> Add New Product
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Revenue', value: `₹${stats.totalSales.toLocaleString()}`, icon: IndianRupee, color: 'text-green-500' },
            { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-primary' },
            { label: 'Active Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500' },
            { label: 'Product Catalog', value: stats.totalProducts, icon: LayoutDashboard, color: 'text-accent' }
          ].map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="p-8 bg-surface border border-border rounded-3xl relative overflow-hidden group"
            >
              <stat.icon className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-5 transition-transform group-hover:scale-110 ${stat.color}`} />
              <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-2">{stat.label}</p>
              <h3 className="text-3xl font-black text-white tracking-tighter">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Products Table */}
        <div className="bg-surface border border-border rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/50">
          <div className="p-8 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-3">
              <TrendingUp className="text-primary" /> Inventory Management
            </h3>
            <div className="flex items-center gap-2 text-xs font-bold text-muted">
              <BarChart3 size={14} /> View Analytics
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-border">
                  <th className="px-8 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Product</th>
                  <th className="px-8 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Category</th>
                  <th className="px-8 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Price</th>
                  <th className="px-8 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Stock</th>
                  <th className="px-8 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product: any) => (
                  <tr key={product._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <img src={product.images[0]} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt="" />
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{product.title}</p>
                          <p className="text-[10px] text-muted">ID: {product._id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white uppercase">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-8 py-4 font-bold text-white">₹{product.price.toLocaleString()}</td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 10 ? 'bg-green-500' : 'bg-orange-500'}`} />
                        <span className="text-sm font-medium text-white">{product.stock} units</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-muted hover:text-white transition-all">
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteProduct(product._id)}
                          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-muted hover:text-accent transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
