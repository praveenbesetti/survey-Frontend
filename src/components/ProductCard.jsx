import React, { useState, memo } from 'react';

/**
 * ProductCard Component
 * Refactored to JSX (JavaScript)
 */
export const ProductCard = memo(function ProductCard({
  product,
  isInCart,
  cartQuantity,
  onAdd,
  onUpdateQuantity
}) {
  const [isSparkling, setIsSparkling] = useState(false);

  const handleAdd = () => {
    setIsSparkling(true);
    onAdd(product);
    // Reset sparkling effect after animation completes
    setTimeout(() => setIsSparkling(false), 600);
  };

  const getBadgeColor = (badge) => {
    const lowerBadge = badge.toLowerCase();
    
    if (lowerBadge.includes('organic') || lowerBadge.includes('fresh')) {
      return 'text-accent-green bg-accent-green/10 border-accent-green/20';
    }
    
    if (lowerBadge.includes('premium') || lowerBadge.includes('best')) {
      return 'text-accent-gold bg-accent-gold/10 border-accent-gold/20';
    }
    
    return 'text-accent-coral bg-accent-coral/10 border-accent-coral/20';
  };

  return (
    <div className="glass-card p-2.5 sm:p-4 relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col h-full overflow-hidden bg-white">
      {/* Badge */}
      {product.badge && (
        <div
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 backdrop-blur-sm border px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-bold z-10 ${getBadgeColor(product.badge)}`}
        >
          {product.badge}
        </div>
      )}

      {/* Product Image */}
      <div className="relative h-24 sm:h-40 mb-2 sm:mb-4 -mx-2.5 -mt-2.5 sm:-mx-4 sm:-mt-4 overflow-hidden rounded-t-[15px]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-80" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-sm sm:text-lg font-bold text-text-primary font-poppins leading-tight mb-0.5 sm:mb-1 truncate">
          {product.name}
        </h3>
        <p className="text-[10px] sm:text-xs text-text-secondary mb-0.5 truncate">
          {product.farmName}
        </p>
        <p className="text-xs sm:text-sm text-text-secondary mb-2 sm:mb-4">
          {product.unit}
        </p>

        <div className="mt-auto">
          <div className="text-lg sm:text-2xl font-bold text-accent-green mb-2 sm:mb-4">
            ₹{product.price}
          </div>

          {/* Controls */}
          <div className="relative h-9 sm:h-11">
            {/* Sparkle Animation Layers */}
            {isSparkling && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <span
                  className="text-lg sm:text-2xl absolute -top-3 -left-1 sm:-top-4 sm:-left-2"
                  style={{ animation: 'sparkle 0.6s ease-out forwards' }}
                >
                  ✨
                </span>
                <span
                  className="text-base sm:text-xl absolute -bottom-1 right-0 sm:-bottom-2"
                  style={{ animation: 'sparkle 0.6s ease-out 0.1s forwards' }}
                >
                  ✨
                </span>
                <span
                  className="text-xl sm:text-3xl absolute top-0 right-2 sm:right-4"
                  style={{ animation: 'sparkle 0.6s ease-out 0.2s forwards' }}
                >
                  ✨
                </span>
              </div>
            )}

            {!isInCart ? (
              <button
                onClick={handleAdd}
                className="glow-btn w-full h-full flex items-center justify-center text-[11px] sm:text-sm whitespace-nowrap"
              >
                Add to Cart ✨
              </button>
            ) : (
              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl h-full px-1 sm:px-2 shadow-sm">
                <button
                  onClick={() => onUpdateQuantity(product.id, cartQuantity - 1)}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-text-secondary hover:bg-gray-100 rounded-full transition-colors font-bold text-base sm:text-lg"
                >
                  −
                </button>
                <span className="font-bold text-text-primary w-6 sm:w-8 text-center text-sm">
                  {cartQuantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(product.id, cartQuantity + 1)}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-accent-green hover:bg-accent-green/10 rounded-full transition-colors font-bold text-base sm:text-lg"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});