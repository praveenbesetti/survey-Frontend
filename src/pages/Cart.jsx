import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CartItem } from '../components/CartItem';
export function Cart() {
  const {
    cart,
    cartCount,
    cartTotal,
    deliveryCharge,
    gst,
    grandTotal,
    updateQuantity,
    removeFromCart
  } = useCart();
  if (cartCount === 0) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 flex flex-col items-center justify-center max-w-7xl mx-auto">
        <div className="glass-card p-12 text-center max-w-md w-full bg-white">
          <div
            className="text-8xl mb-6"
            style={{
              animation: 'float 4s ease-in-out infinite'
            }}>

            🛒
          </div>
          <h2 className="font-poppins text-3xl font-bold text-text-primary mb-3">
            Your cart is empty
          </h2>
          <p className="text-text-secondary mb-8">
            Add some fresh veggies to your cart
          </p>
          <Link to="/shop" className="glow-btn inline-block">
            Explore Shop ✨
          </Link>
        </div>
      </div>);

  }
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-7xl mx-auto">
      <h1 className="font-poppins text-3xl md:text-4xl font-bold text-text-primary mb-8">
        Your Cart
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Cart Items */}
        <div className="flex-1">
          {cart.map((item) =>
          <CartItem
            key={item.id}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart} />

          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="w-full lg:w-96">
          <div className="glass-card p-6 sticky top-24 bg-white">
            <h3 className="font-poppins text-xl font-bold text-text-primary mb-6 border-b border-gray-100 pb-4">
              Order Summary
            </h3>

            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Items ({cartCount})</span>
                <span className="text-text-primary">₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Delivery</span>
                {deliveryCharge === 0 ?
                <span className="text-accent-green font-bold">FREE 🎉</span> :

                <span className="text-text-primary">₹{deliveryCharge}</span>
                }
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>GST (5%)</span>
                <span className="text-text-primary">₹{gst}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between items-end">
                <span className="text-text-primary font-bold">Grand Total</span>
                <span className="text-3xl font-bold text-accent-green">
                  ₹{grandTotal}
                </span>
              </div>
            </div>

            {deliveryCharge > 0 &&
            <p className="text-xs text-text-secondary mb-6 text-center">
                🌱 Free delivery on orders above ₹199
              </p>
            }

            <Link
              to="/checkout"
              className="glow-btn w-full block text-center text-lg">

              Proceed to Checkout →
            </Link>
          </div>
        </div>
      </div>
    </div>);

}