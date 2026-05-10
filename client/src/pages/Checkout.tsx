import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { CreditCard, Truck, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'India'
  });

  const finalAmount = total + 29;

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please sign in to complete your order');
      return;
    }

    if (!address.street || !address.city || !address.zip) {
      toast.error('Please fill in your shipping details');
      return;
    }

    setLoading(true);

    try {
      // 1. Create Order in our Backend
      const orderRes = await axios.post('/api/orders', {
        items: items.map(i => ({ product: i.id, quantity: i.quantity, price: i.price })),
        totalAmount: finalAmount,
        shippingAddress: address
      });

      const orderId = orderRes.data._id;

      // 2. Create Razorpay Order
      const { data: razorpayOrder } = await axios.post('/api/payments/order', {
        amount: finalAmount,
        orderId: orderId
      });

      // 3. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'your_key_id',
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Vanik Premium",
        description: "Payment for your exclusive purchase",
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          try {
            await axios.post('/api/payments/verify', {
              ...response,
              orderId: orderId
            });
            toast.success('Payment Successful!');
            clearCart();
            navigate('/orders');
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#8B5CF6",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 max-w-5xl mx-auto">
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-10">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Shipping Form */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Shipping Details</h2>
            </div>
            
            <div className="grid gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest">Street Address</label>
                <input 
                  type="text" 
                  value={address.street}
                  onChange={(e) => setAddress({...address, street: e.target.value})}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
                  placeholder="H.No, Street, Locality"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest">City</label>
                  <input 
                    type="text" 
                    value={address.city}
                    onChange={(e) => setAddress({...address, city: e.target.value})}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest">ZIP Code</label>
                  <input 
                    type="text" 
                    value={address.zip}
                    onChange={(e) => setAddress({...address, zip: e.target.value})}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">2</div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Payment Method</h2>
              </div>
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-primary rounded-xl text-white">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white">Razorpay Secure Checkout</h3>
                  <p className="text-xs text-muted">UPI, Cards, NetBanking, Wallets</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="p-8 bg-surface rounded-3xl border border-border shadow-2xl shadow-black/50 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Truck size={120} />
              </div>
              
              <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest">Final Summary</h3>
              
              <div className="space-y-4 mb-8">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-muted font-medium">{item.title} (x{item.quantity})</span>
                    <span className="font-bold text-white/80">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="h-px bg-border my-4" />
                <div className="flex justify-between text-muted text-xs">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-muted text-xs">
                  <span>Shipping Fee</span>
                  <span className="text-primary font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-muted text-xs">
                  <span>Platform Fee</span>
                  <span>₹29</span>
                </div>
                <div className="flex justify-between text-2xl font-black text-white pt-4">
                  <span>Total</span>
                  <span className="text-primary">₹{finalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button 
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Pay Securely Now <ArrowRight size={20} /></>}
              </button>
              
              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-muted text-[10px] font-bold uppercase tracking-widest">
                  <ShieldCheck size={14} className="text-primary" />
                  100% Secure Checkout
                </div>
                <div className="flex gap-4 opacity-30 grayscale">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
