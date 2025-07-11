import { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ScrollBar from './components/ScrollBar';  // Import ScrollBar component
import Sidebar from './components/Sidebar';
import OnboardingZone from './pages/OnboardingZone';
import YourHistory from './pages/YourHistory';
import Login from './pages/Login';
import ShopDetailsPage from './components/ShopDetailsPage';
import ProtectedRoute from './components/ProtectedRoute';
import Leads from './pages/Leads'; // Import the Leads component
import AdminZone from './pages/AdminZone'; // Import AdminZone component

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Layout component to include the Sidebar and main content area
const Layout = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar isDarkMode={isDarkMode} />
      <div className="flex-1 h-screen overflow-y-auto">
        <Outlet context={{ isDarkMode, toggleDarkMode }} />
      </div>
    </div>
  );
};

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  return (
    <QueryClientProvider client={queryClient}>
      <ScrollBar /> {/* Apply custom scrollbar styles globally */}
      <Routes>
        {/* Login route - accessible without authentication */}
        <Route path="/login" element={<Login />} />
        {/* Protected routes - wrapped by ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}>
            <Route path="/" element={<OnboardingZone />} />
            <Route path="/your-history" element={<YourHistory />} />
            <Route path="/admin" element={<AdminZone />} /> {/* Updated route to use AdminZone */}
            <Route path="/shop/:id" element={<ShopDetailsPage isDarkMode={isDarkMode} />} />
            <Route path="/leads" element={<Leads />} /> {/* New route for Leads */}
          </Route>
        </Route>
        {/* Redirect any unhandled routes to login if not authenticated */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </QueryClientProvider>
  );
};

export default App;
