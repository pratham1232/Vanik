import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

const ProductCard = ({ product }: { product: any }) => {
  const { addItem } = useCart();

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="group relative bg-surface/50 border border-border rounded-[2rem] overflow-hidden transition-all hover:border-primary/30"
    >
      {/* Image Wrap */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img 
          src={product.images[0]} 
          alt={product.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60" />
        
        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-4 left-4 bg-accent text-white text-[10px] font-black px-2 py-1 rounded-lg">
            {product.discount}% OFF
          </div>
        )}

        {/* Wishlist Button */}
        <button className="absolute top-4 right-4 p-2.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-accent hover:text-white transition-all">
          <Heart size={16} />
        </button>

        {/* Quick Add */}
        <div className="absolute bottom-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={(e) => { e.preventDefault(); addItem(product); }}
            className="p-3 rounded-2xl bg-primary text-white shadow-xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Info */}
      <Link to={`/product/${product.id || product._id}`} className="block p-5">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
            {product.category}
          </span>
          <div className="flex items-center gap-1 ml-auto">
            <Star size={10} className="fill-yellow-500 text-yellow-500" />
            <span className="text-[10px] font-bold text-muted">{product.rating || '4.5'}</span>
          </div>
        </div>
        
        <h3 className="text-sm font-bold text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        <p className="text-[11px] text-muted mb-3 line-clamp-1">By {product.seller?.name || product.sellerName}</p>
        
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-black text-white">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-muted line-through">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
