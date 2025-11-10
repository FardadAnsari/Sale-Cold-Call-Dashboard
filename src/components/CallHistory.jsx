import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import plusIcon from '../images/Plus.png';
import deleteContainerImg from '../images/DeleteContainer.png';
import Swal from 'sweetalert2';
import axios from 'axios';
import { API_BASE_URL } from 'src/api';
import useUser from 'src/useUser';

const CallHistory = ({ isDarkMode = true, shopId, sessionId }) => {
  const { data: user } = useUser();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [availability, setAvailability] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });
  const [openDay, setOpenDay] = useState('Monday');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Received shopId in CallHistory:', shopId);
  }, [shopId]);

  const handleTimeChange = (day, index, field, value) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].map((slot, i) => (i === index ? { ...slot, [field]: value } : slot)),
    }));
  };

  const addTimeSlot = (day) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: [...prev[day], { start: '09:00', end: '17:00' }],
    }));
  };

  const removeTimeSlot = (day, index) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  const handleAvailabilitySubmit = () => {
    console.log('Owner Availability Submitted:', JSON.stringify(availability, null, 2));
    setShowAvailabilityForm(false);
    Swal.fire({
      icon: 'success',
      title: 'Availability Saved!',
      text: 'Owner availability has been successfully updated.',
      background: isDarkMode ? '#4A5568' : '#fff',
      color: isDarkMode ? '#E2E8F0' : '#1A202C',
      confirmButtonColor: '#3B82F6',
    });
  };

  const toggleAvailabilityForm = () => {
    setShowAvailabilityForm(!showAvailabilityForm);
  };

  // Single submit handler for both forms
  const onSubmit = async (formData) => {
    setLoading(true);

    try {
      const authToken = sessionStorage.getItem('authToken');

       if (!sessionId) {
         Swal.fire({
           icon: 'error',
           title: 'Error!',
           text: 'No active session found. Please create a case first.',
           background: isDarkMode ? '#4A5568' : '#fff',
           color: isDarkMode ? '#E2E8F0' : '#1A202C',
           confirmButtonColor: '#A78BFA',
         });
         setLoading(false);
         return;
       }

      // Step 1: Update Sale Session (Case)
      const leadPayload = {
        last_update: new Date().toISOString(),
        customer: {
          shop_id_company: shopId,
          customer_name: formData.shopOwnerName,
          customer_phone: formData.shopOwnerPhone,
          customer_assistant_phone: formData.gateKeeperPhone,
          customer_assistant_name: formData.gateKeeperName,
          customer_availability: availability,
        },
      };

      const sessionResponse = await axios.patch(
        `${API_BASE_URL}/history/sale-sessions-update/${sessionId}/`,
        leadPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      console.log('Session created:', sessionResponse);

      // Step 2: Create History (Call Summary)
      const now = new Date();
      const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();

      const historyPayload = {
        date: new Date().toISOString(),
        user_id: user.id || 0,
        call_time: localISO,
        sale_session_id: sessionId ?? 0,
        call_description: formData.callDescription,
        stage: formData.callResult,
      };

      await axios.post(`${API_BASE_URL}/history/create-history/`, historyPayload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Success message
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Case and call summary have been submitted successfully.',
        background: isDarkMode ? '#4A5568' : '#fff',
        color: isDarkMode ? '#E2E8F0' : '#1A202C',
        confirmButtonColor: '#A78BFA',
      });

      // Reset form
      reset();
      setAvailability({
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      });
    } catch (error) {
      console.error('Submission Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'An error occurred while submitting the form.',
        background: isDarkMode ? '#4A5568' : '#fff',
        color: isDarkMode ? '#E2E8F0' : '#1A202C',
        confirmButtonColor: '#A78BFA',
      });
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className='relative flex h-full flex-1 flex-col'>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #6b7280 #374151;
        }
        .custom-scrollbar {
          scroll-behavior: smooth;
        }
      `}</style>

      {showAvailabilityForm ? (
        <>
          <h2 className='mb-3 text-lg font-semibold text-gray-200'>Set Owner Availability</h2>
          <div className='custom-scrollbar flex-1 overflow-y-auto p-6'>
            <div className='flex h-full flex-col'>
              <div className='custom-scrollbar flex-1 overflow-y-auto pr-2'>
                {daysOfWeek.map((day) => (
                  <div key={day} className='mb-2 rounded-md bg-gray-800 p-3'>
                    <div
                      className='flex cursor-pointer items-center justify-between'
                      onClick={() => setOpenDay(openDay === day ? null : day)}
                    >
                      <span className='font-medium text-gray-200'>{day}</span>
                      <svg
                        className={`h-5 w-5 transition-transform duration-200 ${openDay === day ? 'rotate-180' : ''}`}
                        fill='currentColor'
                        viewBox='0 0 20 20'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          fillRule='evenodd'
                          d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </div>
                    {openDay === day && (
                      <div className='mt-3 space-y-2'>
                        {availability[day].map((slot, slotIndex) => (
                          <div key={slotIndex} className='flex items-center gap-2'>
                            <div className='flex flex-1 items-center gap-2'>
                              <input
                                type='time'
                                value={slot.start}
                                onChange={(e) =>
                                  handleTimeChange(day, slotIndex, 'start', e.target.value)
                                }
                                className='rounded border border-gray-500 bg-gray-600 px-2 py-1 text-sm text-white focus:border-orange-400 focus:outline-none'
                              />
                              <span className='text-sm text-gray-300'>To</span>
                              <input
                                type='time'
                                value={slot.end}
                                onChange={(e) =>
                                  handleTimeChange(day, slotIndex, 'end', e.target.value)
                                }
                                className='rounded border border-gray-500 bg-gray-600 px-2 py-1 text-sm text-white focus:border-orange-400 focus:outline-none'
                              />
                            </div>
                            <button
                              type='button'
                              onClick={() => removeTimeSlot(day, slotIndex)}
                              className='rounded-md bg-gray-600 p-2 transition-colors duration-200 hover:bg-gray-500'
                            >
                              <img src={deleteContainerImg} alt='Delete' className='h-4 w-4' />
                            </button>
                          </div>
                        ))}
                        <button
                          type='button'
                          onClick={() => addTimeSlot(day)}
                          className='flex h-6 w-6 items-center justify-center rounded-sm bg-blue-500 transition-colors duration-200 hover:bg-blue-600'
                        >
                          <img src={plusIcon} alt='Add' className='h-3 w-3' />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className='mt-auto flex justify-center border-t border-gray-600 pt-4'>
                <button
                  onClick={handleAvailabilitySubmit}
                  className='rounded-md bg-blue-500 px-6 py-2 font-medium text-white transition-colors duration-200 hover:bg-blue-600'
                >
                  Save Availability
                </button>
              </div>
              <div className='mt-6 flex justify-center'>
                <button
                  onClick={toggleAvailabilityForm}
                  className='rounded-md bg-gray-500 px-6 py-2 font-medium text-white transition-colors duration-200 hover:bg-gray-600'
                >
                  Back to Call Summary
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className='custom-scrollbar flex flex-1 flex-col gap-6 overflow-y-auto'>
          {/* Combined Form */}
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 rounded-lg px-4'>
            {/* Case Creation Section */}
            <div className='space-y-4'>
              <h2 className='text-sm font-medium text-gray-400'>Shop Information</h2>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <label
                    htmlFor='shopOwnerName'
                    className='mb-1 block text-sm font-medium text-gray-400'
                  >
                    Shop Owner's Name
                  </label>
                  <input
                    type='text'
                    id='shopOwnerName'
                    className='h-[36px] w-full rounded-md border border-gray-600 bg-gray-600 px-3 py-2 text-sm font-medium text-gray-100 placeholder-gray-400 placeholder:text-xs focus:border-orange-400 focus:ring-1 focus:ring-orange-400 focus:outline-none'
                    placeholder="Enter owner's name"
                    {...register('shopOwnerName')} // Removed required validation
                  />
                  {/* Removed error display for shopOwnerName */}
                </div>

                <div>
                  <label
                    htmlFor='shopOwnerPhone'
                    className='mb-1 block text-sm font-medium text-gray-400'
                  >
                    Shop Owner's Phone
                  </label>
                  <input
                    type='tel'
                    id='shopOwnerPhone'
                    className='h-[36px] w-full rounded-md border border-gray-600 bg-gray-600 px-3 py-2 text-sm font-medium text-gray-100 placeholder-gray-400 placeholder:text-xs focus:border-orange-400 focus:ring-1 focus:ring-orange-400 focus:outline-none'
                    placeholder="Enter owner's phone"
                    {...register('shopOwnerPhone')} // Removed required validation
                  />
                  {/* Removed error display for shopOwnerPhone */}
                </div>
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <label
                    htmlFor='gateKeeperName'
                    className='mb-1 block text-sm font-medium text-gray-400'
                  >
                    Gate Keeper's Name
                  </label>
                  <input
                    type='text'
                    id='gateKeeperName'
                    className='h-[36px] w-full rounded-md border border-gray-600 bg-gray-600 px-3 py-2 text-sm font-medium text-gray-100 placeholder-gray-400 placeholder:text-xs focus:border-orange-400 focus:ring-1 focus:ring-orange-400 focus:outline-none'
                    placeholder="Enter gatekeeper's name"
                    {...register('gateKeeperName')}
                  />
                </div>

                <div>
                  <label
                    htmlFor='gateKeeperPhone'
                    className='mb-1 block text-sm font-medium text-gray-400'
                  >
                    Gate Keeper's Phone
                  </label>
                  <input
                    type='tel'
                    id='gateKeeperPhone'
                    className='h-[36px] w-full rounded-md border border-gray-600 bg-gray-600 px-3 py-2 text-sm font-medium text-gray-100 placeholder-gray-400 placeholder:text-xs focus:border-orange-400 focus:ring-1 focus:ring-orange-400 focus:outline-none'
                    placeholder="Enter gatekeeper's phone"
                    {...register('gateKeeperPhone')}
                  />
                </div>
              </div>

              <div>
                <button
                  type='button'
                  onClick={toggleAvailabilityForm}
                  className='flex h-[28px] flex-1 items-center justify-center gap-1 rounded-md border border-white bg-gray-700 px-2 text-sm font-medium whitespace-nowrap text-white transition-colors duration-200 hover:bg-gray-800'
                >
                  <img src={plusIcon} alt='Add' className='mr-1 h-4 w-4' />
                  Add Owner Availability
                </button>
              </div>

              {availability && (
                <div className='mt-3 rounded-md bg-gray-900 p-3 text-sm text-gray-200'>
                  <div className='mb-2 font-medium text-gray-300'>Current Availability:</div>
                  <ul className='list-inside list-disc space-y-1'>
                    {daysOfWeek.map((day) => {
                      const validSlots = availability[day]?.filter(
                        (slot) => slot.start !== '00:00' || slot.end !== '00:00'
                      );
                      if (validSlots && validSlots.length > 0) {
                        const times = validSlots
                          .map((slot) => `${slot.start}-${slot.end}`)
                          .join(', ');
                        return (
                          <li key={day}>
                            <span className='font-semibold'>{day}</span>: {times}
                          </li>
                        );
                      }
                      return null;
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* Call Summary Section */}
            <div className='space-y-4'>
              <h2 className='text-sm font-medium text-gray-400'>Call Details</h2>

              <div>
                <label
                  htmlFor='callResult'
                  className='mb-1 block text-sm font-medium text-gray-400'
                >
                  Select Call Result<span className='ml-1 text-red-500'>*</span>
                </label>
                <select
                  id='callResult'
                  className='h-[36px] w-full appearance-none rounded-md border border-gray-600 bg-gray-600 px-3 py-2 text-sm text-gray-100 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 focus:outline-none'
                  {...register('callResult', { required: true })}
                >
                  <option value=''>-- Select --</option>
                  <option value='Intrested'>Interested</option>
                  <option value='Appointment Is Set'>Appointment Is Set</option>
                  <option value='Not Interested'>Not Interested</option>
                  <option value='Follow Up'>Follow Up</option>
                  <option value='Hung Up'>Hung Up</option>
                  <option value='Fourth Action'>Fourth Action</option>
                  <option value='No Answer'>No Answer</option>
                  <option value='Invalid Number'>Invalid Number</option>
                  <option value='Voice Mail'>Voice Mail</option>
                  <option value='Wrong Number'>Wrong Number</option>
                </select>
                {errors.callResult && <span className='text-xs text-red-500'>Required</span>}
              </div>

              <div>
                <label
                  htmlFor='callDescription'
                  className='mb-1 block text-sm font-medium text-gray-400'
                >
                  Call Description<span className='ml-1 text-red-500'>*</span>
                </label>
                <textarea
                  id='callDescription'
                  rows='4'
                  className='w-full resize-none rounded-md border border-gray-600 bg-gray-600 p-2 text-sm text-gray-100 placeholder-gray-400 placeholder:text-xs focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none'
                  placeholder='Enter call description...'
                  {...register('callDescription', { required: true })}
                ></textarea>
                {errors.callDescription && <span className='text-xs text-red-500'>Required</span>}
              </div>
            </div>

            {/* Single Submit Button */}
            <div className='flex justify-center pt-4'>
              <button
                type='submit'
                disabled={loading}
                className='h-[36px] w-full rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {loading ? 'Submitting...' : 'Submit All'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CallHistory;
