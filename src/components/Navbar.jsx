import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const { cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Check Auth
  const isLoggedIn = sessionStorage.getItem("isAuthenticated") === "true";

  // 2. Define Links
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Login', path: '/login', hideIfLoggedIn: true },
    { name: 'Dashboard', path: '/admin-Dashboard', protected: true },
    { name: 'Sub-Agent Details', path: '/sub-agent-details', protected: true },
    { name: 'Agent Details', path: '/agent-details', protected: true },
    {name: 'Survey Managment', path:'/surveyManagment', protected:true},
  ];

  // 3. Filter Links
  const filteredLinks = navLinks.filter(link => {
    if (link.protected && !isLoggedIn) return false;
    if (link.hideIfLoggedIn && isLoggedIn) return false;
    return true;
  });

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl">🌿</span>
          <span className="font-bold text-xl text-green-600">HariyaliMart</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center space-x-8">
          {filteredLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className={`text-sm font-medium ${location.pathname === link.path ? 'text-green-600' : 'text-gray-600'}`}
            >
              {link.name}
            </Link>
          ))}
          {isLoggedIn && (
            <button onClick={handleLogout} className="px-3 py-1 text-sm bg-red-500 text-white rounded-md">
              Logout
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white p-4 space-y-2">
          {filteredLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className="block py-2 text-gray-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}