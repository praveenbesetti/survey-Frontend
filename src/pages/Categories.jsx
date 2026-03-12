import React from 'react';
import { Link } from 'react-router-dom';

const categoryList = [
  { id: 1, name: 'Vegetables', path: '/shop', icon: '🥦', color: 'bg-green-50', desc: 'Fresh from Farm' },
  { id: 2, name: 'Fruits', path: '/shop', icon: '🍎', color: 'bg-red-50', desc: 'Sweet & Juicy' },
  { id: 3, name: 'Milk & Dairy', path: '/shop', icon: '🥛', color: 'bg-blue-50', desc: 'Fresh Milk & Paneer' },
  { id: 4, name: 'Oil & Ghee', path: '/shop', icon: '🧈', color: 'bg-yellow-50', desc: 'Cooking Essentials' },
  { id: 5, name: 'Ice Cream', path: '/shop', icon: '🍦', color: 'bg-pink-50', desc: 'Frozen Delights' },
  { id: 6, name: 'Rice & Grains', path: '/shop', icon: '🌾', color: 'bg-orange-50', desc: 'Premium Quality' },
  { id: 7, name: 'Atta & Dal', path: '/shop', icon: '🍞', color: 'bg-amber-50', desc: 'Daily Staples' },
  { id: 8, name: 'Beverages', path: '/shop', icon: '🥤', color: 'bg-purple-50', desc: 'Juices & Soda' },
];

export function Categories() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-7xl mx-auto bg-[#F8F9FB]">
      {/* Header Section */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="font-poppins text-2xl md:text-3xl font-black text-text-primary mb-1">
          What are you looking for?
        </h1>
        <p className="text-text-secondary text-sm">Order items in minutes</p>
      </div>

      {/* Category Grid using Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {categoryList.map((cat) => (
          <Link
            key={cat.id}
            to={cat.path}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col items-center text-center no-underline"
          >
            {/* Image/Icon Container */}
            <div className={`w-full aspect-square ${cat.color} rounded-xl flex items-center justify-center text-5xl mb-3 group-hover:scale-105 transition-transform duration-300`}>
              {cat.icon}
            </div>
            
            {/* Text Labels */}
            <h3 className="font-bold text-text-primary text-sm sm:text-base mb-1">
              {cat.name}
            </h3>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
              {cat.desc}
            </p>
          </Link>
        ))}
      </div>

      {/* Feature Banner */}
      <div className="mt-10 rounded-2xl bg-accent-green/10 p-6 flex items-center justify-between border border-accent-green/20">
        <div>
          <h2 className="text-accent-green font-bold text-lg">Superfast Delivery</h2>
          <p className="text-text-secondary text-sm">Get your groceries in 15 mins</p>
        </div>
        <div className="text-3xl animate-pulse">⚡</div>
      </div>
    </div>
  );
}