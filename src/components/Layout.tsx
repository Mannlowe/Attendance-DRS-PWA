import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, UserCheck, Calendar, Settings, History, LogOut } from 'lucide-react';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto bg-white min-h-screen flex flex-col">
        <header className="bg-[#040286] text-white p-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold" style={{ fontFamily: 'Montserrat' }}>Employee Portal</h1>
          <button onClick={handleLogout} title="Logout" className="ml-auto p-2 hover:bg-blue-700 rounded-full">
            <LogOut size={24} />
          </button>
        </header>
        
        <main className="flex-1 p-4">
          <Outlet />
        </main>

        <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0" style={{ fontFamily: 'Montserrat' }}>
          <div className="max-w-lg mx-auto px-4">
            <div className="flex justify-around py-2">
              {/* <Link
                to="/"
                className={`flex flex-col items-center ${
                  location.pathname === '/' ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <Home size={24} />
                <span className="text-xs mt-1">Home</span>
              </Link> */}
              <Link
                to="/Settings"
                className={`flex flex-col items-center ${
                  location.pathname === '/Settings' ? 'text-[#040286]' : 'text-gray-600'
                }`}
              >
                <Settings size={24} />
                <span className="text-xs mt-1">Settings</span>
              </Link>
              <Link
                to="/logs"
                className={`flex flex-col items-center ${
                  location.pathname === '/logs' ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <History size={24} />
                <span className="text-xs mt-1">Logs</span>
              </Link>
              {/* <Link
                to="/leaves"
                className={`flex flex-col items-center ${
                  location.pathname === '/leaves' ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <Calendar size={24} />
                <span className="text-xs mt-1">Leaves</span>
              </Link> */}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default Layout;