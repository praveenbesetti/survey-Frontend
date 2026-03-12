import React from 'react';
import { X } from 'lucide-react';

/**
 * CartItem Component
 * Refactored to JSX (JavaScript)
 */
export function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div className="glass-card p-3 sm:p-4 flex items-center gap-2.5 sm:gap-4 mb-3 sm:mb-4 bg-white">
      {/* Image */}
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-text-primary font-poppins truncate text-sm sm:text-base">
          {item.name}
        </h4>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-text-secondary">
          <span>{item.unit}</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline truncate">{item.farmName}</span>
        </div>
      </div>

      {/* Controls & Price */}
      <div className="flex items-center gap-2 sm:gap-4 md:gap-6 flex-shrink-0">
        <div className="flex items-center bg-white border border-gray-200 rounded-lg px-0.5 sm:px-1 py-0.5 sm:py-1 shadow-sm">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-text-secondary hover:bg-gray-100 rounded transition-colors text-sm sm:text-base"
          >
            −
          </button>
          <span className="font-bold text-text-primary w-5 sm:w-6 text-center text-xs sm:text-sm">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-accent-green hover:bg-accent-green/10 rounded transition-colors text-sm sm:text-base"
          >
            +
          </button>
        </div>

        <div className="w-12 sm:w-16 text-right font-bold text-text-primary text-sm sm:text-base">
          ₹{item.price * item.quantity}
        </div>

        <button
          onClick={() => onRemove(item.id)}
          className="p-1 sm:p-2 text-gray-400 hover:text-accent-coral hover:bg-accent-coral/10 rounded-full transition-all"
          aria-label="Remove item"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}