import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import hiImage from '../images/Hi.png';
import { EmailIcon } from 'src/Icons'; // Assuming EmailIcon is in Icons.jsx
import '../styles/font.css';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required.';
    } else if (!emailRegex.test(email)) {
      return 'Invalid email address. Please try again.';
    }
    return true;
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required.';
    } else if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    return true;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setLoginError(''); // Clear previous errors

    try {
      // Step 1: Get the authentication token
      const tokenResponse = await fetch('https://sale.mega-data.co.uk/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error('Login failed:', errorData);
        if (errorData.email && Array.isArray(errorData.email) && errorData.email.length > 0) {
            setLoginError(`Email error: ${errorData.email[0]}`);
        } else {
            setLoginError(errorData.detail || 'Invalid credentials. Please try again.');
        }
        setLoading(false);
        return; // Stop execution if token request fails
      }

      const tokenResult = await tokenResponse.json();
      const accessToken = tokenResult.access; // Assuming the token is in 'access' field based on common practices

      // Step 2: Verify the token by fetching user data
      const userResponse = await fetch('https://sale.mega-data.co.uk/user/', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (userResponse.ok) {
        // If user data is fetched successfully (200 OK), authentication is valid
        console.log('User verification successful');
        sessionStorage.setItem('authToken', accessToken);
        navigate('/', { replace: true });
      } else if (userResponse.status === 401) {
        // If token is invalid (401 Unauthorized)
        console.error('User verification failed: Token is invalid.');
        setLoginError('Authentication failed. Please log in again.');
        sessionStorage.removeItem('authToken'); // Ensure no invalid token is stored
      } else {
        // Handle other potential errors from the user endpoint
        const errorData = await userResponse.json();
        console.error('User verification failed with status:', userResponse.status, errorData);
        setLoginError(errorData.detail || 'An unexpected error occurred during verification.');
      }

    } catch (error) {
      console.error('Network error or unexpected issue:', error);
      setLoginError('Could not connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111928] flex items-center justify-center px-4 py-8">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center lg:items-stretch lg:justify-end gap-24">
        {/* Left Side - Login Form */}
        <div className="w-full max-w-md flex-shrink-0 lg:mr-auto">
          <div className="bg-[#2D3748] rounded-lg p-8 shadow-xl">
            <h2 className="text-white text-2xl font-semibold mb-6 font-custom">Log in</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2 font-custom">
                  Your email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EmailIcon />
                  </div>
                  <input
                    type="email"
                    {...register('email', {
                      validate: validateEmail
                    })}
                    placeholder="name@flowbite.com"
                    className={`w-full pl-10 pr-3 py-3 bg-[#4A5568] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 font-custom ${
                      errors.email
                        ? 'border-red-500 border-2 focus:ring-red-500 focus:border-red-500'
                        : 'border-2 border-gray-700 focus:ring-orange-500 focus:border-transparent'
                    }`}
                  />
                </div>
                {errors.email && <p className="mt-2 text-sm text-red-500 font-custom">{errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2 font-custom">
                  Password
                </label>
                <input
                  type="password"
                  {...register('password', {
                    validate: validatePassword
                  })}
                  placeholder="••••••••"
                  className={`w-full px-3 py-3 bg-[#4A5568] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 font-custom ${
                    errors.password
                      ? 'border-red-500 border-2 focus:ring-red-500 focus:border-red-500'
                      : 'border-2 border-gray-700 focus:ring-orange-500 focus:border-transparent'
                  }`}
                />
                {errors.password && <p className="mt-2 text-sm text-red-500 font-custom">{errors.password.message}</p>}
              </div>

              {/* Login Error Message */}
              {loginError && (
                <p className="mt-2 text-sm text-red-500 font-custom text-center">{loginError}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#2D3748] font-custom disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging In...' : 'Log In'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side - Welcome Message (now an image) */}
        <div className="hidden lg:flex w-full max-w-lg flex-col items-center justify-center text-center">
          <img src={hiImage} alt="Welcome back" className="w-full h-auto object-contain max-h-[400px]" />
        </div>
      </div>
    </div>
  );
};

export default Login;