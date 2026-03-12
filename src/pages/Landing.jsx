import React from 'react';
import { Link } from 'react-router-dom';
export function Landing() {
  const floatingVeg = ['🥬', '🍅', '🥕', '🥦', '🧅', '🫑', '🌽', '🥒'];
  return (
    <div className="min-h-screen pt-16">
      {/* HERO SECTION */}
      <section className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden px-4">
        {/* Floating background veggies */}
        {floatingVeg.map((emoji, i) =>
        <div
          key={i}
          className="absolute text-4xl md:text-6xl opacity-10 pointer-events-none"
          style={{
            top: `${10 + Math.random() * 80}%`,
            left: `${5 + Math.random() * 90}%`,
            animation: `float-veggie ${4 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`
          }}>

            {emoji}
          </div>
        )}

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent-green/30 bg-accent-green/10 text-accent-green text-sm font-bold mb-8">
            <span
              style={{
                animation: 'glow-pulse 2s infinite'
              }}>

              ⚡
            </span>{' '}
            15 Min Delivery
          </div>

          <h1 className="font-poppins font-bold leading-tight mb-6">
            <span className="block text-5xl md:text-7xl text-accent-green mb-2">
              Fresh Magic
            </span>
            <span className="block text-4xl md:text-5xl text-text-primary">
              Delivered in 15 Minutes
            </span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
            Experience the enchantment of farm-fresh vegetables arriving at your
            doorstep faster than you can say "Hariyali".
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/shop" className="glow-btn text-lg w-full sm:w-auto">
              Shop Now →
            </Link>
            <button className="glow-btn-outline text-lg w-full sm:w-auto">
              View Offers
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            className="glass-card p-8 text-center group"
            style={{
              animation: 'float 6s ease-in-out infinite'
            }}>

            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-text-primary font-poppins mb-3">
              15 Min Delivery
            </h3>
            <p className="text-text-secondary">
              From farm to your door faster than you can say vegetables.
            </p>
          </div>
          <div
            className="glass-card p-8 text-center group"
            style={{
              animation: 'float 6s ease-in-out infinite 1s'
            }}>

            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
              🌱
            </div>
            <h3 className="text-xl font-bold text-text-primary font-poppins mb-3">
              100% Farm Fresh
            </h3>
            <p className="text-text-secondary">
              Sourced directly from verified local farms every morning.
            </p>
          </div>
          <div
            className="glass-card p-8 text-center group"
            style={{
              animation: 'float 6s ease-in-out infinite 2s'
            }}>

            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
              💰
            </div>
            <h3 className="text-xl font-bold text-text-primary font-poppins mb-3">
              Best Price
            </h3>
            <p className="text-text-secondary">
              Farm-direct pricing means you save up to 40% vs supermarkets.
            </p>
          </div>
        </div>
      </section>

      {/* CATEGORIES PREVIEW */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="font-poppins text-3xl md:text-4xl font-bold text-center mb-12 shimmer-text">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
          {
            name: 'Leafy',
            emoji: '🥬',
            img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop'
          },
          {
            name: 'Root',
            emoji: '🥕',
            img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop'
          },
          {
            name: 'Gourds',
            emoji: '🥒',
            img: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&h=300&fit=crop'
          },
          {
            name: 'Exotic',
            emoji: '🥦',
            img: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop'
          }].
          map((cat) =>
          <Link
            key={cat.name}
            to="/shop"
            state={{
              category: cat.name
            }}
            className="glass-card overflow-hidden group relative h-48 flex items-end p-6">

              <img
              src={cat.img}
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 group-hover:scale-110" />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="relative z-10 flex items-center gap-3">
                <span className="text-3xl group-hover:scale-125 transition-transform duration-300">
                  {cat.emoji}
                </span>
                <span className="font-bold font-poppins text-xl text-white group-hover:text-accent-green-light transition-colors">
                  {cat.name}
                </span>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-20 px-4 bg-bg-secondary border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-poppins text-3xl md:text-4xl font-bold text-center text-text-primary mb-12">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-6 bg-white">
              <div className="text-accent-gold mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-text-primary mb-4 italic">
                "Freshest vegetables I've ever had delivered!"
              </p>
              <p className="text-text-secondary font-bold font-poppins">
                — Priya S.
              </p>
            </div>
            <div className="glass-card p-6 bg-white">
              <div className="text-accent-gold mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-text-primary mb-4 italic">
                "15 minutes is real! I timed it."
              </p>
              <p className="text-text-secondary font-bold font-poppins">
                — Rahul M.
              </p>
            </div>
            <div className="glass-card p-6 bg-white">
              <div className="text-accent-gold mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-text-primary mb-4 italic">
                "Love the local farm sourcing. Tastes the difference!"
              </p>
              <p className="text-text-secondary font-bold font-poppins">
                — Anita K.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-12 px-4 border-t border-gray-200 text-center relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <span className="text-2xl">🌿</span>
            <span className="font-poppins font-bold text-2xl text-accent-green">
              HariyaliMart
            </span>
          </div>
          <p className="text-text-secondary mb-8">
            Fresh from farm to your door, with a little magic.
          </p>
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} HariyaliMart. All rights reserved.
          </div>
        </div>
      </footer>
    </div>);

}