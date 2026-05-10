import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Star, ShieldCheck, Heart, Share2, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        toast.error('Product not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary font-bold">Loading Premium Product...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-white transition-all mb-8 font-bold uppercase tracking-widest text-[10px]">
          <ArrowLeft size={16} /> Back to Collection
        </button>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Media Gallery */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square rounded-[3rem] overflow-hidden border border-border bg-surface/50"
            >
              <img src={product.images[activeImg]} alt={product.title} className="w-full h-full object-cover" />
            </motion.div>
            <div className="flex gap-4">
              {product.images.map((img: string, i: number) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImg(i)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-primary' : 'border-border opacity-50'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                  {product.category}
                </span>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  <Star size={12} className="fill-yellow-500 text-yellow-500" />
                  <span className="text-[10px] font-bold text-white">{product.rating || '4.8'}</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 leading-tight uppercase">
                {product.title}
              </h1>
              <p className="text-muted font-medium text-lg leading-relaxed">{product.description}</p>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-surface/50 border border-border mb-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-muted text-[10px] font-black uppercase tracking-widest block mb-1">Exclusive Price</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black text-white tracking-tighter">₹{product.price.toLocaleString('en-IN')}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-lg text-muted line-through font-bold">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
                {product.discount > 0 && (
                  <div className="bg-accent text-white px-4 py-2 rounded-2xl font-black text-sm">
                    {product.discount}% OFF
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { addItem(product); toast.success('Added to Bag!'); }}
                  className="flex-1 py-5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
                >
                  <ShoppingCart size={20} /> Add to Bag
                </button>
                <button className="p-5 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center">
                  <Heart size={20} />
                </button>
              </div>
            </div>

            {/* Seller Info */}
            <div className="flex items-center gap-4 p-6 rounded-3xl bg-white/5 border border-white/5 mb-8">
              <img src={product.seller?.avatar || 'https://i.pravatar.cc/100'} alt="" className="w-12 h-12 rounded-full border border-white/10" />
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest block">Curated By</span>
                <span className="text-sm font-bold text-white">{product.seller?.name || 'Style Studio'}</span>
              </div>
              <button className="ml-auto p-3 rounded-xl bg-white/5 border border-white/10 text-muted hover:text-white transition-all">
                <Share2 size={18} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3 text-muted">
                <ShieldCheck size={20} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">Lifetime Warranty</span>
              </div>
              <div className="flex items-center gap-3 text-muted">
                <Info size={20} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">Ethically Sourced</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
