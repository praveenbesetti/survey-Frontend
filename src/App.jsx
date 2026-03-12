import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ParticleBackground } from './components/ParticleBackground';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Shop } from './pages/Shop';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Categories } from './pages/Categories';
import { SurveyForm } from './pages/SurveyForm';
import Admin from "./pages/admin"
function AppLayout() {
  const location = useLocation();
  return (
    <div className="relative min-h-screen bg-bg-primary text-text-primary font-inter overflow-x-hidden">
      {location.pathname === '/' && <ParticleBackground />}
      <Navbar />

      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/survey" element={<SurveyForm />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
           <Route path="/admin-Dashboard" element={<Admin/>} />
        </Routes>
      </main>
    </div>);

}
export function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </CartProvider>);

}