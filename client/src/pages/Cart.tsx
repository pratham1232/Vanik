import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

const Cart = () => {
  const { items, removeItem, updateQuantity, total, count } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-surface border border-border text-white hover:bg-white/5 transition-all">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Your Shopping Bag</h1>
          <span className="text-muted font-bold ml-2">({count} items)</span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-surface/30 rounded-[3rem] border border-border border-dashed">
            <div className="text-6xl mb-6">🛍️</div>
            <h2 className="text-xl font-bold text-white mb-2">Your bag is empty</h2>
            <p className="text-muted mb-8">Looks like you haven't added anything yet.</p>
            <Link to="/explore" className="px-8 py-3 bg-primary text-white rounded-xl font-bold inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={item.id} 
                  className="flex flex-col sm:flex-row gap-6 p-6 bg-surface/50 border border-border rounded-3xl"
                >
                  <div className="w-full sm:w-32 aspect-square rounded-2xl overflow-hidden bg-background">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-white">{item.title}</h3>
                      <button onClick={() => removeItem(item.id)} className="text-muted hover:text-accent transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="text-sm text-muted mb-6">Premium handcrafted item</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 bg-background px-4 py-2 rounded-xl border border-border">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-muted hover:text-white">
                          <Minus size={16} />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-muted hover:text-white">
                          <Plus size={16} />
                        </button>
                      </div>
                      <span className="text-xl font-black text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="p-8 bg-surface rounded-3xl border border-border sticky top-32 shadow-2xl shadow-black/50">
                <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest">Order Summary</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-muted">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-bold text-white/80">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span className="font-medium">Shipping</span>
                    <span className="font-bold text-primary italic uppercase text-[10px]">Free</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span className="font-medium">Platform Fee</span>
                    <span className="font-bold text-white/80">₹29</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between text-xl font-black text-white">
                    <span>Total</span>
                    <span className="text-primary">₹{(total + 29).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all mb-4"
                >
                  Proceed to Checkout
                </button>
                
                <div className="flex items-center justify-center gap-2 text-muted text-[10px] font-bold uppercase tracking-widest">
                  <ShieldCheck size={14} className="text-primary" />
                  Secure Transaction via Razorpay
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
