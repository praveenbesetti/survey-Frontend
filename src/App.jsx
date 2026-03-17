import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ParticleBackground } from './components/ParticleBackground';
import { Navbar } from './components/Navbar';
import Login from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { protectedRoutes } from './routes/routesConfig';
import axios from 'axios';
import { API_BASE } from './url';
import 'antd/dist/reset.css';
import { Shop } from './pages/Shop';
import { Landing } from './pages/Landing';

axios.defaults.baseURL = API_BASE;
function AppLayout() {
  const location = useLocation();
  
  // Use exact matching
  const isLoginPage = location.pathname.toLowerCase() === "/login";
  const isLandingPage = location.pathname === "/";

  return (
    <div className="relative min-h-screen bg-white">
      {/* Background only on exact home */}
      {isLandingPage && <ParticleBackground />}
      
      {/* Show Navbar on everything except Login */}
      {!isLoginPage && <Navbar />}

      <main className={`${!isLoginPage ? 'pt-20 px-4 pb-10' : ''}`}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            {protectedRoutes.map((route, idx) => (
              <Route key={idx} path={route.path} element={route.element} />
            ))}
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </CartProvider>
  );
}