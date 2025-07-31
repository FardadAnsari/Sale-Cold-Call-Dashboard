import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import onboardingPng from '../images/Sale.png';
import historyPng from '../images/History.png';
import usersHistoryPng from '../images/UsersHistory.png';
import casesPng from '../images/cases.png';
import leadsPng from '../images/leadside.png';
import profilePng from '../images/Profile.png';
import logoutPng from '../images/logout.png';
import ChangePassword from '../images/ChangePassword.png';
import useUser from 'src/useUser';
import ChangePasswordModal from './ChangePasswordModal';
import ConfirmLogoutModal from './ConfirmLogoutModal';

const Sidebar = ({ isDarkMode }) => {
  const {data:user}= useUser()
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const profileButtonRef = useRef(null);
  const popupRef = useRef(null);

 const isActiveLink = (path) => {
   return location.pathname === path || location.pathname.startsWith(`${path}/`);
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

  return (
    <div
      className={`flex w-64 flex-col p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900'} relative mx-auto`}
    >
      <nav className='flex-grow'>
        <ul className='space-y-3'>
          <li>
            <Link to='/shops' className={linkStyle(isActiveLink('/shops'), isDarkMode)}>
              <img src={onboardingPng} alt='Onboarding' className='h-6 w-6' />
              <span>Onboarding Zone</span>
            </Link>
          </li>
          <li>
            <Link
              to='/your-history'
              className={linkStyle(isActiveLink('/your-history'), isDarkMode)}
            >
              <img src={historyPng} alt='History' className='h-6 w-6' />
              <span>Your History</span>
            </Link>
          </li>
          <li>
            <Link
              to='/users-histories'
              className={linkStyle(isActiveLink('/users-histories'), isDarkMode)}
            >
              <img src={usersHistoryPng} alt='UsersHistories' className='h-6 w-6' />
              <span>Users Histories</span>
            </Link>
          </li>
          <li>
            <Link to='/cases' className={linkStyle(isActiveLink('/cases'), isDarkMode)}>
              <img src={casesPng} alt='Cases' className='h-6 w-6' />
              <span>Cases</span>
            </Link>
          </li>
          <li>
            <Link to='/leads' className={linkStyle(isActiveLink('/leads'), isDarkMode)}>
              <img src={leadsPng} alt='Leads' className='h-6 w-6' />
              <span>Leads</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Profile Button - Moved to the bottom and separated */}
      <div className='relative mt-auto pt-6'>
        <button
          ref={profileButtonRef}
          className={profileButtonStyle(isDarkMode)}
          onClick={handleProfileClick}
        >
          <img src={profilePng} alt='Profile' className='h-6 w-6' />
          <span>Your Profile</span>
        </button>
        {/* Profile Popup */}
        {showProfilePopup && (
          <div
            ref={popupRef}
            className={`absolute bottom-0 left-full z-50 ml-2 w-48 rounded-lg border shadow-lg ${
              isDarkMode
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white text-gray-900'
            }`}
          >
            <div className='p-3'>
              <div className='mb-3 flex items-center space-x-3'>
                <img src={profilePng} alt='Profile' className='h-8 w-8 rounded-full' />
                <div>
                  <p className='font-medium'>
                    {user?.name ?? <span className='animate-pulse'>Loading...</span>}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowProfilePopup(false);
                  setShowChangePasswordModal(true);
                }}
                className={`flex w-full space-x-2 ${profileButtonStyle(isDarkMode)} text-xs hover:scale-100`}
              >
                <img src={ChangePassword} alt='Change Password' className='h-4 w-4' />
                <span>Change Password</span>
              </button>
              <hr className={`my-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`} />
              <button
                onClick={() => {
                  setShowLogoutModal(true);
                  setShowProfilePopup(false);
                }}
                className={`flex w-full items-center space-x-2 rounded-md bg-red-700 px-3 py-2 text-left text-white transition-colors hover:bg-red-800`}
              >
                <img src={logoutPng} alt='Logout' className='h-4 w-4' />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
        {showChangePasswordModal && (
          <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />
        )}
        {showLogoutModal && (
          <ConfirmLogoutModal
            onConfirm={() => {
              setShowLogoutModal(false);
              sessionStorage.clear();
              navigate('/login');
            }}
            onCancel={() => setShowLogoutModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Sidebar;