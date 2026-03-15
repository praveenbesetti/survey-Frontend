import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ParticleBackground } from './components/ParticleBackground';
import { Navbar } from './components/Navbar';
import  Login  from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { protectedRoutes } from './routes/routesConfig';
import axios from 'axios';
import { API_BASE } from './url';
import 'antd/dist/reset.css';

axios.defaults.baseURL = API_BASE; // Set your API base URL here

function AppLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isLandingPage = location.pathname === "/";

  return (
    <div className="relative min-h-screen bg-bg-primary text-text-primary font-inter overflow-x-hidden">
      {/* Background & Nav Logic */}
      {isLandingPage && <ParticleBackground />}
      {!isLoginPage && <Navbar />}

      {/* Global Spacing: If not login, push content down 80px to clear Navbar */}
      <main className={`relative z-10 ${!isLoginPage ? 'pt-20 px-4 pb-10' : ''}`}>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes mapped from config */}
          <Route element={<ProtectedRoute />}>
            {protectedRoutes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
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