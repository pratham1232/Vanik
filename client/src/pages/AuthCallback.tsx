import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Brief delay to show success animation
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-10 h-10 rounded-full bg-primary"
        />
      </motion.div>
      <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Authenticating</h1>
      <p className="text-muted text-sm font-medium">Completing your secure login...</p>
    </div>
  );
};

export default AuthCallback;
