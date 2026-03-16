import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Menu, X, ShoppingCart } from 'lucide-react';
import axios from 'axios';
export function Navbar() {
  const { cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 1. CHANGE THIS: Look for the key your Login page actually sets
  const isLoggedIn = sessionStorage.getItem("isAuthenticated") === "true";

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    // These will now show up because isLoggedIn will be true
    { name: 'Dashboard', path: '/admin-Dashboard', protected: true },
    { name: 'Sub-Agent Details', path: '/sub-agent-details', protected: true },
    { name: 'Agent Details', path: '/agent-details', protected: true }
  ];

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("isAuthenticated");
    
     sessionStorage.removeItem("token");
      navigate("/login");
      window.location.reload();

    } catch (err) {
      console.error("Logout API failed, clearing local data anyway.");
    }

  };

  // ... rest of your return code remains the same
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌿</span>
            <span className="font-poppins font-bold text-xl tracking-wider text-accent-green">
              HariyaliMart
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">

            {navLinks.map((link) => {

              if (link.protected && !isLoggedIn) return null;

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-all duration-300 hover:text-accent-green relative group ${location.pathname === link.path
                    ? 'text-accent-green'
                    : 'text-text-secondary'
                    }`}
                >
                  {link.name}

                  <span
                    className={`absolute -bottom-1 left-0 w-full h-0.5 bg-accent-green transform origin-left transition-transform duration-300 ${location.pathname === link.path
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                  />
                </Link>
              );
            })}

          </div>

          {/* Cart + Logout + Mobile */}
          <div className="flex items-center space-x-4">

            {/* Cart */}
            {/* <Link
              to="/cart"
              className="relative p-2 text-text-secondary hover:text-accent-green transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />

              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-accent-coral rounded-full">
                  {cartCount}
                </span>
              )}
            </Link> */}

            {/* Logout Desktop */}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="hidden md:block px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition"
              >
                Logout
              </button>
            )}

            {/* Mobile Toggle */}
            <button
              className="md:hidden p-2 text-text-secondary hover:text-accent-green"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

          </div>

        </div>

      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">

          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">

            {navLinks.map((link) => {

              if (link.protected && !isLoggedIn) return null;

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === link.path
                    ? 'text-accent-green bg-accent-green/10'
                    : 'text-text-secondary hover:text-accent-green hover:bg-gray-50'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Mobile Logout */}
            {isLoggedIn && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-red-600 font-medium hover:bg-gray-50"
              >
                Logout
              </button>
            )}

          </div>

        </div>
      )}

    </nav>
  );
}