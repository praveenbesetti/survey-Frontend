import React from 'react';
import Navbar from './Navbar'; // Your existing Navbar component

const AppLayout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f7fe' }}>
      {/* Fixed Navbar */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        width: '100%', 
        zIndex: 1000,
        height: '64px' // Standard Ant Design Header height
      }}>
        <Navbar />
      </div>

      {/* Content Area */}
      <main style={{ 
        paddingTop: '84px', // 64px (nav height) + 20px (gap)
        paddingLeft: '24px',
        paddingRight: '24px',
        paddingBottom: '40px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;