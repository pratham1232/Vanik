import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, TrendingUp, ShieldCheck, Star } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="aura-top absolute inset-0 -z-10" />
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8"
          >
            <Zap size={14} /> New Summer Collection is here
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-[0.9]"
          >
            SHOP THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">FUTURE</span> <br /> OF COMMERCE.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted text-lg max-w-2xl mx-auto mb-10 font-medium"
          >
            Vanik brings you the most exclusive handcrafted premium products 
            directly from creators. Resell, earn, and build your own shop.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
              Explore Collection <ArrowRight size={20} />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-surface border border-border text-white rounded-2xl font-bold hover:bg-white/5 transition-all">
              Become a Seller
            </button>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-10 border-y border-white/5 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-3 text-muted">
            <ShieldCheck size={24} className="text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest">Secure Payments</span>
          </div>
          <div className="flex items-center gap-3 text-muted">
            <TrendingUp size={24} className="text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest">Resell & Earn</span>
          </div>
          <div className="flex items-center gap-3 text-muted">
            <Zap size={24} className="text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest">Fast Delivery</span>
          </div>
          <div className="flex items-center gap-3 text-muted">
            <Star size={24} className="text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest">Verified Sellers</span>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter mb-2 uppercase">Trending Now</h2>
            <div className="h-1 w-20 bg-primary rounded-full" />
          </div>
          <button className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all">
            See All <ArrowRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[4/6] rounded-[2rem] bg-surface animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product: any) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
