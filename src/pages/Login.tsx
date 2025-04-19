import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Mic, Eye, EyeOff } from 'lucide-react';
import { loginWithAPI } from '../api/APILogin';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await loginWithAPI({ usr: email, pwd: password });
      if (response.message.success_key === 1) {
        // Optionally: Store sid, api_key, api_secret, etc. in localStorage/sessionStorage
        localStorage.setItem('sid', response.message.sid);
        localStorage.setItem('api_key', response.message.api_key);
        localStorage.setItem('api_secret', response.message.api_secret);
        localStorage.setItem('username', response.message.username);
        localStorage.setItem('email', response.message.email);
        localStorage.setItem('employee_id', response.message.employee_id);
        localStorage.setItem('base_url', response.message.base_url);
        navigate('/Settings');
      } else {
        setError(response.message.message || 'Login failed.');
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message && err.response.data.message.message) {
        setError(err.response.data.message.message);
      } else {
        setError('Login failed. Please check your credentials or try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        fontFamily: 'Montserrat',
        background: 'linear-gradient(159deg, rgba(30,144,255,1) 0%, rgba(153,186,221,1) 100%)',
      }}
    >
      <div className="relative w-full max-w-sm ">
        {/* Top yellow circle with mic icon */}
        <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-blue-700 rounded-b-full w-36 h-20 flex flex-col items-center justify-end shadow-2xl">
            <span className="text-lg text-white pb-2  mb-5" style={{ fontFamily: 'Montserrat',fontWeight: '600' }}>Mannlowe</span>
          </div>
        </div>
        <form
          onSubmit={handleLogin}
          className="bg-white pt-16 pb-8 px-6 rounded-3xl shadow-lg w-full space-y-7"
        >
          {/* Email Field */}
          <div className="flex items-center bg-gray-100 rounded-lg px-4 py-3 mt-10">
            <Mail size={20} className="text-gray-400 mr-3" />
            <input
              id="email"
              type="email"
              placeholder="Email Address"
              className="bg-transparent flex-1 outline-none text-gray-700 placeholder-gray-400 text-base font-medium"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          {/* Password Field */}
          <div className="flex items-center bg-gray-100 rounded-lg px-4 py-3 relative">
            <Lock size={20} className="text-gray-400 mr-3" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="bg-transparent flex-1 outline-none text-gray-700 placeholder-gray-400 text-base font-medium pr-8"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 focus:outline-none"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="flex justify-center w-full">
            <button
              type="submit"
              className="w-1/3 h-12 bg-blue-700 text-white rounded-xl shadow-black text-lg transition mt-2 font-medium"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontFamily: 'Rubik' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
          {error && (
            <div className="text-center text-red-600 font-medium mt-2" style={{ fontFamily: 'Rubik' }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
