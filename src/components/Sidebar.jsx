import { Link } from 'react-router-dom';

const Sidebar = ({ isDarkMode }) => {
  return (
    <div className={`w-64 p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900'}`}>
      <nav>
        <ul className="space-y-3">
          <li>
            <Link
              to="/"
              className={`block w-full text-center py-3 px-4 rounded-lg font-medium transition-all duration-300 transform ${
                isDarkMode
                  ? 'hover:bg-gray-700 hover:scale-105 hover:shadow-lg text-white focus:outline-none focus:ring-4 focus:ring-gray-500/50 focus:bg-gray-600 active:bg-gray-600'
                  : 'hover:bg-gray-300 hover:scale-105 hover:shadow-xl text-gray-800 shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-400/50 focus:bg-gray-300 active:bg-gray-400'
              }`}
            >
              Sale Zone
            </Link>
          </li>
          <li>
            <Link
              to="/history"
              className={`block w-full text-center py-3 px-4 rounded-lg font-medium transition-all duration-300 transform ${
                isDarkMode
                  ? 'hover:bg-gray-700 hover:scale-105 hover:shadow-lg text-white focus:outline-none focus:ring-4 focus:ring-gray-500/50 focus:bg-gray-600 active:bg-gray-600'
                  : 'hover:bg-gray-300 hover:scale-105 hover:shadow-xl text-gray-800 shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-400/50 focus:bg-gray-300 active:bg-gray-400'
              }`}
            >
              History
            </Link>
          </li>
          <li>
            <Link
              to="/admin"
              className={`block w-full text-center py-3 px-4 rounded-lg font-medium transition-all duration-300 transform ${
                isDarkMode
                  ? 'hover:bg-gray-700 hover:scale-105 hover:shadow-lg text-white focus:outline-none focus:ring-4 focus:ring-gray-500/50 focus:bg-gray-600 active:bg-gray-600'
                  : 'hover:bg-gray-300 hover:scale-105 hover:shadow-xl text-gray-800 shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-400/50 focus:bg-gray-300 active:bg-gray-400'
              }`}
            >
              Admin Zone
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
