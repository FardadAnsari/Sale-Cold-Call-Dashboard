import { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ScrollBar from './components/ScrollBar';
import Sidebar from './components/Sidebar';
import OnboardingZone from './Pages/OnboardingZone';
import YourHistory from './Pages/YourHistory';
import Login from './Pages/Login';
import CaseDetails from './Pages/CaseDetails';
import ShopDetails from './Pages/ShopDetails';
import ProtectedRoute from './components/ProtectedRoute';
import Leads from './Pages/Leads';
import Cases from './Pages/Cases'; 
import UsersHistories from './Pages/UsersHistories';
import UserHistory from './Pages/UserHistory';

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
      <ScrollBar />
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}>
            <Route path='/shops' element={<OnboardingZone />} />
            <Route path='/your-history' element={<YourHistory />} />
            <Route path='/users-histories' element={<UsersHistories />} />
            <Route path='/users-histories/:id' element={<UserHistory />} />
            <Route path='/cases' element={<Cases />} />
            <Route path='/cases/:id' element={<CaseDetails isDarkMode={isDarkMode} />} />
            <Route path='/shops/:id' element={<ShopDetails isDarkMode={isDarkMode} />} />
            <Route path='/leads' element={<Leads />} />
          </Route>
        </Route>
        <Route path='*' element={<Navigate to='/login' replace />} />
      </Routes>
    </QueryClientProvider>
  );
};

export default App;