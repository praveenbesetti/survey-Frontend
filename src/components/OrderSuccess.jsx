import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

/**
 * OrderSuccess Component
 * Refactored to JSX (JavaScript)
 */
export function OrderSuccess({ orderId }) {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  // State for explosion particles (Type annotation removed)
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate explosion particles
    const newParticles = Array.from({
      length: 30
    }).map((_, i) => ({
      id: i,
      angle: Math.random() * Math.PI * 2,
      distance: 50 + Math.random() * 150,
      delay: Math.random() * 0.2
    }));
    setParticles(newParticles);
  }, []);

  const handleContinue = () => {
    clearCart();
    navigate('/');
  };

  const deliveryTime = new Date(Date.now() + 15 * 60000).toLocaleTimeString(
    [],
    {
      hour: '2-digit',
      minute: '2-digit'
    }
  );

  return (
    <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative max-w-md w-full text-center flex flex-col items-center">
        
        {/* Explosion Particles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute w-2 h-2 bg-accent-green rounded-full shadow-[0_0_10px_#16a34a]"
              style={{
                transform: `translate(${Math.cos(p.angle) * p.distance}px, ${Math.sin(p.angle) * p.distance}px)`,
                opacity: 0,
                animation: `sparkle 1s ease-out ${p.delay}s forwards`
              }} 
            />
          ))}
        </div>

        {/* Checkmark */}
        <div
          className="w-24 h-24 bg-accent-green/10 border-2 border-accent-green rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(22,163,74,0.2),inset_0_0_20px_rgba(22,163,74,0.1)]"
          style={{
            animation: 'success-scale 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
          }}
        >
          <Check className="w-12 h-12 text-accent-green" strokeWidth={3} />
        </div>

        <h2 className="font-poppins text-4xl md:text-5xl font-bold text-text-primary mb-4">
          Order Placed!
        </h2>

        <p className="text-xl text-text-secondary mb-2">
          Delivering in 15 minutes 🚀
        </p>

        <p className="text-text-secondary mb-8">
          Order #{orderId} • Arriving by {deliveryTime}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button className="glow-btn-outline flex-1">Track Order 📍</button>
          <button onClick={handleContinue} className="glow-btn flex-1">
            Continue Shopping →
          </button>
        </div>
      </div>
    </div>
  );
}