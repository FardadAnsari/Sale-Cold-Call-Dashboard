import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import SaleZone from './Pages/SaleZone';
import ShopDetailsPage from './components/ShopDetailsPage';

const Layout = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <div className="flex">
      <Sidebar isDarkMode={isDarkMode} />
      <div className="flex-1 h-screen overflow-auto">
        <Outlet context={{ isDarkMode, toggleDarkMode }} />
      </div>
    </div>
  );
};

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Changed from false to true

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Routes>
      <Route element={<Layout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}>
        <Route path="/" element={<SaleZone isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
        <Route path="/history" element={<div>History</div>} />
        <Route path="/admin" element={<div>Admin Zone</div>} />
      </Route>
      <Route path="/shop/:id" element={<ShopDetailsPage isDarkMode={isDarkMode} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;