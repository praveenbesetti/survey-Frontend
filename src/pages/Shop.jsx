import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';

export function Shop() {
  const location = useLocation();
  const initialCategory = location.state?.category || 'All';
  const { cart, addToCart, updateQuantity } = useCart();
  
  // FIXED: Changed useSyncExternalStore to useState
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = ['All', 'Leafy', 'Root', 'Gourds', 'Exotic'];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-7xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <h1 className="font-poppins text-3xl md:text-4xl font-bold text-text-primary flex items-center gap-3">
          Fresh Vegetables{' '}
          <span
            className="text-3xl"
            style={{
              animation: 'float-veggie 3s infinite'
            }}
          >
            🌿
          </span>
        </h1>

        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="glow-input pl-10"
            placeholder="Search fresh veggies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex overflow-x-auto pb-4 mb-8 gap-3 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-6 py-2 rounded-full font-medium transition-all duration-300 border ${
              selectedCategory === cat 
                ? 'bg-accent-green text-white border-accent-green shadow-md' 
                : 'bg-white border-gray-200 text-text-secondary hover:border-accent-green hover:text-accent-green'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
          {filteredProducts.map((product) => {
            const cartItem = cart.find((item) => item.id === product.id);
            return (
              <ProductCard
                key={product.id}
                product={product}
                isInCart={!!cartItem}
                cartQuantity={cartItem?.quantity || 0}
                onAdd={addToCart}
                onUpdateQuantity={updateQuantity} 
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 glass-card bg-white">
          <div className="text-6xl mb-4 opacity-50">🔍</div>
          <h3 className="text-xl font-bold text-text-primary mb-2 font-poppins">
            No vegetables found
          </h3>
          <p className="text-text-secondary">
            Try adjusting your search or category filter.
          </p>
        </div>
      )}
    </div>
  );
}