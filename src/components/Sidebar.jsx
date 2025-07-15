import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import onboardingPng from '../images/Sale.png';
import historyPng from '../images/History.png';
import casesPng from '../images/cases.png';
import leadsPng from '../images/leadside.png';
import profilePng from '../images/Profile.png';
import logoutPng from '../images/logout.png'; // Import the logout image

const Sidebar = ({ isDarkMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const profileButtonRef = useRef(null);
  const popupRef = useRef(null);

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target) && 
          profileButtonRef.current && !profileButtonRef.current.contains(event.target)) {
        setShowProfilePopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const linkStyle = (isActive, isDarkMode) => {
    const baseStyle = `block w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 transform flex items-center space-x-2 pl-4`;
    const activeDarkModeStyle = 'bg-gray-700 text-white';
    const inactiveDarkModeStyle = 'hover:bg-gray-700 hover:scale-105 hover:shadow-lg text-white focus:outline-none focus:ring-4 focus:ring-gray-500/50 focus:bg-gray-600 active:bg-gray-600';
    const activeLightModeStyle = 'bg-gray-300 text-gray-800 shadow-sm';
    const inactiveLightModeStyle = 'hover:bg-gray-300 hover:scale-105 hover:shadow-xl text-gray-800 shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-400/50 focus:bg-gray-300 active:bg-gray-400';
    return `${baseStyle} ${isActive ? (isDarkMode ? activeDarkModeStyle : activeLightModeStyle) : (isDarkMode ? inactiveDarkModeStyle : inactiveLightModeStyle)}`;
  };

  // Style for the button that's not a navigation link
  const profileButtonStyle = (isDarkMode) => {
    const baseStyle = `block w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 transform flex items-center space-x-2 pl-4`;
    const darkModeInteractiveStyle = 'hover:bg-gray-700 hover:scale-105 hover:shadow-lg text-white focus:outline-none focus:ring-4 focus:ring-gray-500/50 focus:bg-gray-600 active:bg-gray-600';
    const lightModeInteractiveStyle = 'hover:bg-gray-300 hover:scale-105 hover:shadow-xl text-gray-800 shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-400/50 focus:bg-gray-300 active:bg-gray-400';

    return `${baseStyle} ${isDarkMode ? 'text-white ' + darkModeInteractiveStyle : 'text-gray-800 shadow-sm ' + lightModeInteractiveStyle}`;
  };

  const handleProfileClick = () => {
    setShowProfilePopup(!showProfilePopup);
  };

  const handleLogout = () => {
    // Clear any authentication tokens or user data from localStorage/sessionStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.clear();
    
    // Close the popup
    setShowProfilePopup(false);
    
    // Navigate to login page
    navigate('/login');
  };

  return (
    <div className={`w-64 p-4 flex flex-col ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900'} mx-auto relative`}>
      <nav className="flex-grow">
        <ul className="space-y-3">
          <li>
            <Link
              to="/"
              className={linkStyle(isActiveLink('/'), isDarkMode)}
            >
              <img src={onboardingPng} alt="Onboarding" className="w-6 h-6" />
              <span>Onboarding Zone</span>
            </Link>
          </li>
          <li>
            <Link
              to="/your-history"
              className={linkStyle(isActiveLink('/your-history'), isDarkMode)}
            >
              <img src={historyPng} alt="History" className="w-6 h-6" />
              <span>Your History</span>
            </Link>
          </li>
          <li>
            <Link
              to="/cases"
              className={linkStyle(isActiveLink('/cases'), isDarkMode)}
            >
              <img src={casesPng} alt="Cases" className="w-6 h-6" />
              <span>Cases</span>
            </Link>
          </li>
          <li>
            <Link
              to="/leads"
              className={linkStyle(isActiveLink('/leads'), isDarkMode)}
            >
              <img src={leadsPng} alt="Leads" className="w-6 h-6" />
              <span>Leads</span>
            </Link>
          </li>
        </ul>
      </nav>
      
      {/* Profile Button - Moved to the bottom and separated */}
      <div className="mt-auto pt-6 relative">
        <button
          ref={profileButtonRef}
          className={profileButtonStyle(isDarkMode)}
          onClick={handleProfileClick}
        >
          <img src={profilePng} alt="Profile" className="w-6 h-6" />
          <span>Your Profile</span>
        </button>

        {/* Profile Popup */}
        {showProfilePopup && (
          <div
            ref={popupRef}
            className={`absolute left-full bottom-0 ml-2 w-48 rounded-lg shadow-lg border z-50 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <div className="p-3">
              <div className="flex items-center space-x-3 mb-3">
                <img src={profilePng} alt="Profile" className="w-8 h-8 rounded-full" />
                <div>
                  <p className="font-medium">Trevor</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    On Boarding
                  </p>
                </div>
              </div>
              <hr className={`my-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`} />
              <button
                onClick={handleLogout}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-left transition-colors bg-red-700 text-white hover:bg-red-800`}
              >
                <img src={logoutPng} alt="Logout" className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;