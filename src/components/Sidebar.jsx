import { Link, useLocation } from 'react-router-dom';
import salePng from '../images/sale.png'; // Path to your sale.png
import historyPng from '../images/history.png'; // Path to your history.png
import casesPng from '../images/cases.png'; // Add this line for your cases.png

const Sidebar = ({ isDarkMode }) => {
  const location = useLocation();

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const linkStyle = (isActive, isDarkMode) => {
    // Keep the flex, items-center, justify-start, and pl-4 for consistent alignment
    const baseStyle = `block w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 transform flex items-center space-x-2 pl-4`;
    const activeDarkModeStyle = 'bg-gray-700 text-white';
    const inactiveDarkModeStyle = 'hover:bg-gray-700 hover:scale-105 hover:shadow-lg text-white focus:outline-none focus:ring-4 focus:ring-gray-500/50 focus:bg-gray-600 active:bg-gray-600';
    const activeLightModeStyle = 'bg-gray-300 text-gray-800 shadow-sm';
    const inactiveLightModeStyle = 'hover:bg-gray-300 hover:scale-105 hover:shadow-xl text-gray-800 shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-400/50 focus:bg-gray-300 active:bg-gray-400';

    return `${baseStyle} ${isActive ? (isDarkMode ? activeDarkModeStyle : activeLightModeStyle) : (isDarkMode ? inactiveDarkModeStyle : inactiveLightModeStyle)}`;
  };

  return (
    <div className={`w-64 p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900'} mx-auto`}>
      <nav>
        <ul className="space-y-3">
          <li>
            <Link
              to="/"
              className={linkStyle(isActiveLink('/'), isDarkMode)}
            >
              <img src={salePng} alt="Sale" className="w-6 h-6" />
              <span>Sale Zone</span>
            </Link>
          </li>
          <li>
            <Link
              to="/history"
              className={linkStyle(isActiveLink('/history'), isDarkMode)}
            >
              <img src={historyPng} alt="History" className="w-6 h-6" />
              <span>History</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin" // Keep the path as /admin or change if routing changes
              className={linkStyle(isActiveLink('/admin'), isDarkMode)} // Apply flexbox classes
            >
              {/* Using the PNG image for Cases */}
              <img src={casesPng} alt="Cases" className="w-6 h-6" /> {/* Adjust w-6 h-6 as needed */}
              <span>Cases</span> {/* Changed text from Admin Zone to Cases */}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;