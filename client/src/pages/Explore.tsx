import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Search, Grid, List } from 'lucide-react';

const CATEGORIES = ["All", "Fashion", "Electronics", "Home Decor", "Beauty", "Watches", "Gifts"];

const Explore = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        setProducts(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;
    if (activeCategory !== 'All') {
      result = result.filter((p: any) => p.category === activeCategory);
    }
    if (search) {
      result = result.filter((p: any) => 
        p.title.toLowerCase().includes(search.toLowerCase()) || 
        p.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [search, activeCategory, products]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Explore Collection</h1>
            <p className="text-muted font-medium uppercase tracking-widest text-[10px]">Browsing {filtered.length} Premium Products</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input 
                type="text" 
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            <button className="p-2.5 rounded-xl bg-surface border border-border text-white hover:bg-white/5 transition-all">
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                activeCategory === cat 
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-surface border-border text-muted hover:text-white hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-[4/6] rounded-[2rem] bg-surface animate-pulse border border-border" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 bg-surface/30 rounded-[3rem] border border-border border-dashed">
            <div className="text-5xl mb-4">🔦</div>
            <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
            <p className="text-muted">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {filtered.map((product: any) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Explore;
