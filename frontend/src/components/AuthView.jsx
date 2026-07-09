import React, { useState } from 'react';
import axios from 'axios';
import { CircleDot } from 'lucide-react';
import bgImage from '../assets/loginbg.png';

const API_URL = 'http://localhost:5000/api/auth';

function AuthView({ onLogin }) {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? `${API_URL}/login` : `${API_URL}/register`;
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await axios.post(endpoint, payload);
      const { token, user } = res.data;
      
      onLogin(token, user);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f3f4f6] dark:bg-[#0b0f19] text-gray-900 dark:text-[#e7e7e7] overflow-hidden p-3 gap-3">
      
      {/* Left Side - Hero / Image */}
      <div className="relative hidden md:flex flex-col w-[55%] lg:w-[60%] rounded-[24px] overflow-hidden bg-black p-12 justify-center items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: `url(${bgImage})` }}
        ></div>
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-[#0a0a0a]/40 z-0"></div>

        {/* Bottom Left Pitch */}
        <div className="relative z-10 w-full h-full flex flex-col justify-end p-8 pb-4">
          <div className="flex flex-col gap-2">
            <p className="text-white text-2xl md:text-3xl font-semibold tracking-tight leading-snug max-w-lg">
              Discover, understand, and apply for government schemes effortlessly.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 md:w-[45%] lg:w-[40%] flex flex-col justify-center items-center bg-[#f3f4f6] dark:bg-[#0b0f19] p-8">
        <div className="w-full max-w-[420px]">
          <h2 className="text-2xl font-semibold mb-2 text-center text-gray-900 dark:text-white">
            {isLogin ? 'Log In to Account' : 'Sign Up Account'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 text-center">
            {isLogin ? 'Enter your credentials to access your account.' : 'Enter your personal data to create your account.'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            
            {error && (
              <div className="w-full p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[13px] text-gray-700 dark:text-gray-300 font-medium">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="e.g. John"
                    className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-transparent focus:border-gray-400 dark:focus:border-white/20 text-gray-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600 shadow-sm dark:shadow-none"
                    required={!isLogin}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[13px] text-gray-700 dark:text-gray-300 font-medium">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="e.g. Francisco"
                    className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-transparent focus:border-gray-400 dark:focus:border-white/20 text-gray-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600 shadow-sm dark:shadow-none"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-gray-700 dark:text-gray-300 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. johnfrans@gmail.com"
                className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-transparent focus:border-gray-400 dark:focus:border-white/20 text-gray-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600 shadow-sm dark:shadow-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-gray-700 dark:text-gray-300 font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-transparent focus:border-gray-400 dark:focus:border-white/20 text-gray-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600 shadow-sm dark:shadow-none"
                required
              />
              {!isLogin && <span className="text-[12px] text-gray-500 mt-1">Must be at least 8 characters.</span>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-semibold py-3.5 rounded-xl mt-4 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-70"
            >
              {isLoading ? 'Please wait...' : isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-gray-900 dark:text-white font-medium hover:underline"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default AuthView;
