import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Bell, Search, Menu, X, Sparkles, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, loginWithGoogle } = useAuth();
  const { count } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass bg-background/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link to="/" className="text-2xl font-black tracking-tighter text-white">
              <span className="text-primary text-3xl">V</span>ANIK
            </Link>
            <div className="bg-accent px-1.5 py-0.5 rounded text-[10px] font-bold text-white leading-none">
              LIVE
            </div>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted" />
              </div>
              <input
                type="text"
                className="block w-full bg-surface border border-border rounded-full py-2 pl-10 pr-3 text-sm placeholder-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                placeholder="Search premium products..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user?.role === 'admin' && (
              <Link to="/admin" className="p-2 text-primary hover:text-primary/80 transition-colors">
                <LayoutDashboard size={20} />
              </Link>
            )}
            <Link to="/ai-chat" className="p-2 rounded-full bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all">
              <Sparkles size={20} />
            </Link>
            <button className="p-2 text-white/70 hover:text-white transition-colors relative">
              <Bell size={20} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-background" />
            </button>
            <Link to="/cart" className="p-2 text-white/70 hover:text-white transition-colors relative">
              <ShoppingCart size={20} />
              {count > 0 && (
                <div className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {count}
                </div>
              )}
            </Link>
            
            {user ? (
              <Link to="/profile" className="flex items-center gap-2 ml-2 p-1 pl-1 pr-3 rounded-full bg-surface border border-border hover:border-primary/50 transition-all">
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-white/10" />
                <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <button 
                onClick={loginWithGoogle}
                className="ml-2 px-5 py-2 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <Link to="/cart" className="relative">
              <ShoppingCart size={22} />
              {count > 0 && (
                <div className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {count}
                </div>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden glass bg-background/95 backdrop-blur-2xl border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted" />
                <input
                  type="text"
                  className="w-full bg-surface border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm"
                  placeholder="Search..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/explore" className="flex flex-col items-center justify-center p-4 bg-surface rounded-2xl border border-border">
                  <span className="text-lg mb-1">🔍</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted">Explore</span>
                </Link>
                <Link to="/reels" className="flex flex-col items-center justify-center p-4 bg-surface rounded-2xl border border-border">
                  <span className="text-lg mb-1">🎬</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted">Reels</span>
                </Link>
              </div>
              {!user && (
                <button 
                  onClick={loginWithGoogle}
                  className="w-full py-3 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20"
                >
                  Sign In with Google
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
