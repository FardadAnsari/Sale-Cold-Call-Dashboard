import { Link } from 'react-router-dom';

const Sidebar = ({ isDarkMode }) => {
  return (
    <div className={`w-64 p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900'}`}>
      <nav>
        <ul className="space-y-3">
          <li>
            <Link
              to="/"
              className={`block w-full text-center py-3 px-4 rounded-md font-medium transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-white hover:bg-gray-100 text-gray-800 shadow-sm'
              }`}
            >
              Sale Zone
            </Link>
          </li>
          <li>
            <Link
              to="/history"
              className={`block w-full text-center py-3 px-4 rounded-md font-medium transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-white hover:bg-gray-100 text-gray-800 shadow-sm'
              }`}
            >
              History
            </Link>
          </li>
          <li>
            <Link
              to="/admin"
              className={`block w-full text-center py-3 px-4 rounded-md font-medium transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-white hover:bg-gray-100 text-gray-800 shadow-sm'
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