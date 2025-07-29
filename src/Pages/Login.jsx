import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import hiImage from '../images/Hi.png';
import { EmailIcon } from 'src/Icons';
import '../styles/Font.css';
import { API_BASE_URL } from 'src/api';
import axios from 'axios';

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required.';
    if (!emailRegex.test(email)) return 'Invalid email address. Please try again.';
    return true;
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return true;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setLoginError('');

    try {
      const { data: tokenData } = await axios.post(
        `${API_BASE_URL}/api/token/`,
        {
          email: data.email,
          password: data.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
        }
      );

      const accessToken = tokenData.access;
      sessionStorage.setItem('authToken', accessToken);
      navigate('/shops', { replace: true });
    } catch (error) {
      if (error.response) {
        const { status, data: errorData } = error.response;
        if (status === 401) {
          setLoginError('Authentication failed. Please log in again.');
          sessionStorage.removeItem('authToken');
        } else if (errorData?.email && Array.isArray(errorData.email)) {
          setLoginError(`Email error: ${errorData.email[0]}`);
        } else {
          setLoginError(errorData?.detail || 'Invalid credentials. Please try again.');
        }
        console.error('Login error response:', errorData);
      } else {
        console.error('Network error or unexpected issue:', error);
        setLoginError('Could not connect to the server. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-[#111928] px-4 py-8'>
      <div className='flex w-full max-w-6xl flex-col items-center gap-24 lg:flex-row lg:items-stretch lg:justify-end'>
        <div className='w-full max-w-md flex-shrink-0 lg:mr-auto'>
          <div className='rounded-lg bg-[#2D3748] p-8 shadow-xl'>
            <h2 className='font-custom mb-6 text-2xl font-semibold text-white'>Log in</h2>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
              <div>
                <label className='font-custom mb-2 block text-sm font-medium text-gray-300'>
                  Your email
                </label>
                <div className='relative'>
                  <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                    <EmailIcon />
                  </div>
                  <input
                    type='email'
                    {...register('email', { validate: validateEmail })}
                    placeholder='email'
                    className={`font-custom w-full rounded-md bg-[#4A5568] py-3 pr-3 pl-10 text-white placeholder-gray-400 focus:ring-2 focus:outline-none ${
                      errors.email
                        ? 'border-2 border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-2 border-gray-700 focus:border-transparent focus:ring-orange-500'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className='font-custom mt-2 text-sm text-red-500'>{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className='font-custom mb-2 block text-sm font-medium text-gray-300'>
                  Password
                </label>
                <input
                  type='password'
                  {...register('password', { validate: validatePassword })}
                  placeholder='••••••••'
                  className={`font-custom w-full rounded-md bg-[#4A5568] px-3 py-3 text-white placeholder-gray-400 focus:ring-2 focus:outline-none ${
                    errors.password
                      ? 'border-2 border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-2 border-gray-700 focus:border-transparent focus:ring-orange-500'
                  }`}
                />
                {errors.password && (
                  <p className='font-custom mt-2 text-sm text-red-500'>{errors.password.message}</p>
                )}
              </div>
              {loginError && (
                <p className='font-custom mt-2 text-center text-sm text-red-500'>{loginError}</p>
              )}
              <button
                type='submit'
                disabled={loading}
                className='font-custom w-full rounded-md bg-orange-500 px-4 py-3 font-medium text-white transition duration-200 ease-in-out hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#2D3748] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
              >
                {loading ? 'Logging In...' : 'Log In'}
              </button>
            </form>
          </div>
        </div>
        <div className='hidden w-full max-w-lg flex-col items-center justify-center text-center lg:flex'>
          <img
            src={hiImage}
            alt='Welcome back'
            className='h-auto max-h-[400px] w-full object-contain'
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
