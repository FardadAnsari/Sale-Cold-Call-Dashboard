import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { IoIosEye, IoIosEyeOff } from 'react-icons/io';
import { IoMdClose } from 'react-icons/io';
import { MdError } from 'react-icons/md';
import axios from 'axios';
import { API_BASE_URL } from 'src/api';
import Swal from 'sweetalert2';

const ChangePasswordModal = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm();

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPassVisible, setCurrentPassVisible] = useState(false);
  const [newPassVisible, setNewPassVisible] = useState(false);
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);

  const newPassword = watch('newPass');

  const handleChangePass = async (data) => {
    setIsLoading(true);
    try {
      const authToken = sessionStorage.getItem('authToken');
      if (!authToken) {
        setError('No access token found. Please log in again.');
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/user/change-password/`,
        {
          old_password: data.oldPass,
          new_password: data.newPass,
          confirm_password: data.confirmPass,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.status === 200) {
        setIsLoading(false);
        Swal.fire('Success', 'Password changed successfully!', 'success');
        reset();
        setTimeout(() => {
          sessionStorage.removeItem('authToken');
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setIsLoading(false);
      let message = 'Something went wrong. Please try again later.';

      if (error?.response?.status === 400) {
        message = error.response?.data?.message || 'Invalid input.';
      } else if (error.request) {
        message = 'Network error. Please check your connection.';
      }

      setError(message);
      Swal.fire('Error', message, 'error');
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'>
      <div className='relative w-full max-w-md rounded-lg bg-gray-900 p-6 shadow-lg'>
        {/* Header */}
        <div className='mb-2 flex items-center justify-between'>
          <div></div>
          <button onClick={onClose} className='text-xl text-gray-400 hover:text-white'>
            <IoMdClose />
          </button>
        </div>

        {/* Title */}
        <h2 className='text-sm font-bold text-orange-400'>Change password</h2>
        <h3 className='mb-1 text-xl font-bold text-white'>Let's Change Your Password!</h3>
        <p className='mb-4 text-sm text-gray-400'>Please enter your current password</p>

        {/* Form */}
        <form onSubmit={handleSubmit(handleChangePass)} className='space-y-4'>
          {/* Current Password */}
          <div className='relative'>
            <input
              type={currentPassVisible ? 'text' : 'password'}
              placeholder='Current password'
              {...register('oldPass', {
                required: 'Current password is required',
              })}
              className={`w-full border bg-gray-800 px-4 py-2 text-white ${
                errors.oldPass ? 'border-red-500' : 'border-gray-700'
              } rounded focus:outline-none`}
            />
            <button
              type='button'
              className='absolute top-3 right-3 text-gray-400 hover:text-white'
              onClick={() => setCurrentPassVisible(!currentPassVisible)}
            >
              {currentPassVisible ? <IoIosEye /> : <IoIosEyeOff />}
            </button>
          </div>

          {/* New Password */}
          <div className='relative'>
            <input
              type={newPassVisible ? 'text' : 'password'}
              placeholder='New password'
              {...register('newPass', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters long',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                  message: 'Must include uppercase, lowercase, and a number',
                },
              })}
              className={`w-full border bg-gray-800 px-4 py-2 text-white ${
                errors.newPass ? 'border-red-500' : 'border-gray-700'
              } rounded focus:outline-none`}
            />
            <button
              type='button'
              className='absolute top-3 right-3 text-gray-400 hover:text-white'
              onClick={() => setNewPassVisible(!newPassVisible)}
            >
              {newPassVisible ? <IoIosEye /> : <IoIosEyeOff />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className='relative'>
            <input
              type={confirmPassVisible ? 'text' : 'password'}
              placeholder='Confirm password'
              {...register('confirmPass', {
                required: 'Confirm password is required',
                validate: (value) =>
                  value.trim() === newPassword?.trim() || 'Passwords do not match',
              })}
              className={`w-full border bg-gray-800 px-4 py-2 text-white ${
                errors.confirmPass ? 'border-red-500' : 'border-gray-700'
              } rounded focus:outline-none`}
            />
            <button
              type='button'
              className='absolute top-3 right-3 text-gray-400 hover:text-white'
              onClick={() => setConfirmPassVisible(!confirmPassVisible)}
            >
              {confirmPassVisible ? <IoIosEye /> : <IoIosEyeOff />}
            </button>
          </div>

          {/* Error Messages */}
          {(errors.oldPass || errors.newPass || errors.confirmPass || error) && (
            <div className='flex items-center gap-2 rounded bg-red-500/10 p-2 text-sm text-red-400'>
              <MdError size={20} />
              <span>
                {errors.oldPass?.message ||
                  errors.newPass?.message ||
                  errors.confirmPass?.message ||
                  error}
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type='submit'
            disabled={isLoading}
            className='w-full rounded bg-orange-500 py-2 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50'
          >
            {isLoading ? 'Processing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
