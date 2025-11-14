import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import plusIcon from '../images/Plus.png';
import deleteIcon from '../images/trash.svg';
import Swal from 'sweetalert2';
import axios from 'axios';
import { API_BASE_URL } from 'src/api';
import useUser from 'src/useUser';
import { useQueryClient } from '@tanstack/react-query';

const normalizeAvailability = (rawAvailability) => {
  const defaultStructure = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  return {
    ...defaultStructure,
    ...(rawAvailability || {}),
  };
};

const CaseHistory = ({ isDarkMode = true, caseDetails, onCaseUpdated }) => {
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  console.log('Case details:', caseDetails);

  // Single form for both case update and call summary
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      shopOwnerName: caseDetails?.customer?.customer_name || '',
      shopOwnerPhone: caseDetails?.customer?.customer_phone || '',
      gateKeeperName: caseDetails?.customer?.customer_assistant_name || '',
      gateKeeperPhone: caseDetails?.customer?.customer_assistant_phone || '',
      callResult: '',
      callDescription: '',
    },
  });

  const [sessionId, setSessionId] = useState(0);
  const [showAvailabilityDrawer, setShowAvailabilityDrawer] = useState(false);
  const [availability, setAvailability] = useState(() =>
    normalizeAvailability(caseDetails?.customer?.customer_availability)
  );
  const [openDay, setOpenDay] = useState('Monday');
  const [loading, setLoading] = useState(false);
  const [showDefaultContainer, setShowDefaultContainer] = useState(true);
  const [previousCallResult, setPreviousCallResult] = useState('');

  // Watch the callResult field
  const callResult = watch('callResult');
  const callDescription = watch('callDescription');

  // Default suggestions based on call result
  const callResultSuggestions = {
    'Appointment Is Set':
      'Successfully scheduled an appointment with the shop owner. The meeting is set for discussing service details and next steps.',

    'Not Interested': 'The shop owner expressed that they are not interested in our services.',

    'Follow Up':
      'The shop owner requested a follow-up call. They need more time to consider the proposal or discuss with partners.',

    'Hung Up':
      'The call was disconnected abruptly. The shop owner hung up during the conversation.',

    'No Answer': 'Called multiple times but no answer.',

    'Invalid Number':
      'The phone number appears to be invalid or disconnected. No successful connection made.',

    'Voice Mail':
      'Left a voicemail giving a brief explanation about us and shared our phone number in case they would like to call back.',

    'Wrong Number':
      'Reached someone who confirmed this is not the correct number for the business.',
  };

  // Call results that should NOT show default descriptions
  const noDefaultResults = ['Intrested', 'Fourth Action'];

  // Check if current call result should show default container
  const shouldShowDefaultContainer = () => {
    if (!callResult) return false;

    // Don't show for "Intrested" and "Fourth Action"
    if (noDefaultResults.includes(callResult)) return false;

    // Only show if there's a default suggestion for this result
    if (!callResultSuggestions[callResult]) return false;

    // Only show if description is empty
    return callDescription === '';
  };

  // Update form when caseDetails changes
  useEffect(() => {
    if (caseDetails) {
      setValue('shopOwnerName', caseDetails.customer?.customer_name || '');
      setValue('shopOwnerPhone', caseDetails.customer?.customer_phone || '');
      setValue('gateKeeperName', caseDetails.customer?.customer_assistant_name || '');
      setValue('gateKeeperPhone', caseDetails.customer?.customer_assistant_phone || '');
      setAvailability(normalizeAvailability(caseDetails.customer?.customer_availability));
      setSessionId(caseDetails?.sale_session?.sale_session_id);
    }
  }, [caseDetails, setValue]);

  // Reset when callResult changes
  useEffect(() => {
    if (callResult && callResult !== previousCallResult) {
      // Update the description when call result changes
      if (callResultSuggestions[callResult]) {
        setValue('callDescription', callResultSuggestions[callResult]);
      } else {
        // For results without defaults, clear the field
        setValue('callDescription', '');
      }

      // Update default container visibility
      const shouldShow = shouldShowDefaultContainer();
      setShowDefaultContainer(shouldShow);

      setPreviousCallResult(callResult);
    }
  }, [callResult, previousCallResult]);

  // Show default container only when description is empty and result should show defaults
  useEffect(() => {
    const shouldShow = shouldShowDefaultContainer();
    setShowDefaultContainer(shouldShow);
  }, [callDescription, callResult]);

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

  // Click handler for default text
  const handleDefaultTextClick = (text) => {
    setValue('callDescription', text);
    setShowDefaultContainer(false);
  };

  const handleAvailabilitySubmit = () => {
    console.log('Owner Availability Submitted:', JSON.stringify(availability, null, 2));
    setShowAvailabilityDrawer(false);
    Swal.fire({
      icon: 'success',
      title: 'Availability Saved!',
      text: 'Owner availability has been successfully updated.',
      background: isDarkMode ? '#4A5568' : '#fff',
      color: isDarkMode ? '#E2E8F0' : '#1A202C',
      confirmButtonColor: '#3B82F6',
    });
  };

  const toggleAvailabilityDrawer = () => {
    setShowAvailabilityDrawer(!showAvailabilityDrawer);
  };

  // Refetch data function
  const refetchAllData = async () => {
    try {
      // Invalidate and refetch cases data
      await queryClient.invalidateQueries(['sale-sessions']);

      // Invalidate and refetch specific case details if needed
      if (caseDetails?.sale_session?.sale_session_id) {
        await queryClient.invalidateQueries([
          'case-details',
          caseDetails.sale_session.sale_session_id,
        ]);
      }

      console.log('Data refetched successfully');
    } catch (error) {
      console.error('Error refetching data:', error);
    }
  };

  // Single submit handler for both case update and call summary
  const onSubmit = async (formData) => {
    setLoading(true);

    try {
      const authToken = sessionStorage.getItem('authToken');

      if (!caseDetails?.sale_session?.sale_session_id) {
        throw new Error('No sale session ID available');
      }

      // Step 1: Update Sale Session (Case)
      const leadPayload = {
        last_update: new Date().toISOString(),
        customer: {
          customer_name: formData.shopOwnerName,
          customer_phone: formData.shopOwnerPhone,
          customer_assistant_phone: formData.gateKeeperPhone,
          customer_assistant_name: formData.gateKeeperName,
          customer_availability: availability,
        },
      };
      console.log('Lead Payload', leadPayload);

      const sessionResponse = await axios.patch(
        `${API_BASE_URL}/history/sale-sessions-update/${caseDetails.sale_session.sale_session_id}/`,
        leadPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      console.log('Session updated:', sessionResponse);

      // Step 2: Create History (Call Summary)
      const now = new Date();
      const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();

      const historyPayload = {
        date: new Date().toISOString(),
        user_id: user?.id || 0,
        call_time: localISO,
        sale_session_id: caseDetails.sale_session.sale_session_id,
        call_description: formData.callDescription,
        stage: formData.callResult,
      };

      await axios.post(`${API_BASE_URL}/history/create-history/`, historyPayload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Step 3: Refetch all data
      await refetchAllData();

      // Step 4: Notify parent component about the update
      if (onCaseUpdated) {
        onCaseUpdated();
      }

      // Success message
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Case and call summary have been submitted successfully. Data has been updated.',
        background: isDarkMode ? '#4A5568' : '#fff',
        color: isDarkMode ? '#E2E8F0' : '#1A202C',
        confirmButtonColor: '#A78BFA',
      });

      // Reset form (only call summary fields)
      reset({
        shopOwnerName: formData.shopOwnerName,
        shopOwnerPhone: formData.shopOwnerPhone,
        gateKeeperName: formData.gateKeeperName,
        gateKeeperPhone: formData.gateKeeperPhone,
        callResult: '',
        callDescription: '',
      });
      setShowDefaultContainer(true);
      setPreviousCallResult('');
    } catch (error) {
      console.error('Submission Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'An error occurred while submitting the form.',
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
      {/* Main Form Content */}
      <div className='flex h-full flex-col'>
        <div className='flex-1 overflow-y-auto'>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Case Information Section */}
            <div className='space-y-6'>
              <div className='border-b border-gray-600 pb-4'>
                <span className='text-lg font-semibold text-gray-200'>Shop Information</span>
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <label
                    htmlFor='shopOwnerName'
                    className='mb-2 block text-sm font-medium text-gray-400'
                  >
                    Shop Owner's Name
                  </label>
                  <input
                    type='text'
                    id='shopOwnerName'
                    className='h-[42px] w-full rounded-lg border border-gray-600 bg-gray-600 px-3 py-2 text-sm text-gray-100 placeholder-gray-400 transition-colors focus:border-orange-400 focus:ring-1 focus:ring-orange-400 focus:outline-none'
                    placeholder="Enter owner's name"
                    {...register('shopOwnerName')}
                  />
                </div>

                <div>
                  <label
                    htmlFor='shopOwnerPhone'
                    className='mb-2 block text-sm font-medium text-gray-400'
                  >
                    Shop Owner's Phone
                  </label>
                  <input
                    type='tel'
                    id='shopOwnerPhone'
                    className='h-[42px] w-full rounded-lg border border-gray-600 bg-gray-600 px-3 py-2 text-sm text-gray-100 placeholder-gray-400 transition-colors focus:border-orange-400 focus:ring-1 focus:ring-orange-400 focus:outline-none'
                    placeholder="Enter owner's phone"
                    {...register('shopOwnerPhone')}
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <label
                    htmlFor='gateKeeperName'
                    className='mb-2 block text-sm font-medium text-gray-400'
                  >
                    Gate Keeper's Name
                  </label>
                  <input
                    type='text'
                    id='gateKeeperName'
                    className='h-[42px] w-full rounded-lg border border-gray-600 bg-gray-600 px-3 py-2 text-sm text-gray-100 placeholder-gray-400 transition-colors focus:border-orange-400 focus:ring-1 focus:ring-orange-400 focus:outline-none'
                    placeholder="Enter gatekeeper's name"
                    {...register('gateKeeperName')}
                  />
                </div>

                <div>
                  <label
                    htmlFor='gateKeeperPhone'
                    className='mb-2 block text-sm font-medium text-gray-400'
                  >
                    Gate Keeper's Phone
                  </label>
                  <input
                    type='tel'
                    id='gateKeeperPhone'
                    className='h-[42px] w-full rounded-lg border border-gray-600 bg-gray-600 px-3 py-2 text-sm text-gray-100 placeholder-gray-400 transition-colors focus:border-orange-400 focus:ring-1 focus:ring-orange-400 focus:outline-none'
                    placeholder="Enter gatekeeper's phone"
                    {...register('gateKeeperPhone')}
                  />
                </div>
              </div>

              <div>
                <button
                  type='button'
                  onClick={toggleAvailabilityDrawer}
                  className='flex items-center gap-2 rounded-lg border border-gray-500 bg-gray-700 px-4 py-2 text-sm text-gray-300 transition-colors duration-200 hover:bg-gray-600 hover:text-white'
                >
                  <img src={plusIcon} alt='Add' className='h-4 w-4' />
                  Add Owner Availability
                </button>
              </div>

              {availability && (
                <div className='rounded-lg border border-gray-600 bg-gray-800 p-4'>
                  <div className='mb-3 font-medium text-gray-300'>Current Availability:</div>
                  <div className='grid grid-cols-1 gap-2 text-sm text-gray-200 md:grid-cols-2'>
                    {daysOfWeek.map((day) => {
                      const validSlots = availability[day]?.filter(
                        (slot) => slot.start !== '00:00' || slot.end !== '00:00'
                      );
                      if (validSlots && validSlots.length > 0) {
                        const times = validSlots
                          .map((slot) => `${slot.start}-${slot.end}`)
                          .join(', ');
                        return (
                          <div key={day} className='flex items-center gap-2'>
                            <span className='font-semibold text-gray-300'>{day}:</span>
                            <span className='text-gray-400'>{times}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Call Summary Section */}
            <div className='space-y-6'>
              <div className='border-b border-gray-600 pb-4'>
                <span className='text-lg font-semibold text-gray-200'>Call Details</span>
              </div>

              <div>
                <label
                  htmlFor='callResult'
                  className='mb-2 block text-sm font-medium text-gray-400'
                >
                  Select Call Result<span className='ml-1 text-red-500'>*</span>
                </label>
                <select
                  id='callResult'
                  className='h-[42px] w-full rounded-lg border border-gray-600 bg-gray-600 px-3 py-2 text-sm text-gray-100 transition-colors focus:border-orange-400 focus:ring-1 focus:ring-orange-400 focus:outline-none'
                  {...register('callResult', { required: true })}
                >
                  <option value=''>-- Select Call Result --</option>
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
                {errors.callResult && (
                  <span className='mt-1 text-xs text-red-500'>This field is required</span>
                )}
              </div>

              <div>
                <label
                  htmlFor='callDescription'
                  className='mb-2 block text-sm font-medium text-gray-400'
                >
                  Call Description<span className='ml-1 text-red-500'>*</span>
                </label>

                {/* Default Text Container - Only show for specific results when description is empty */}
                {showDefaultContainer && callResultSuggestions[callResult] && (
                  <div className='mb-4 translate-y-0 transform opacity-100 transition-all duration-300 ease-in-out'>
                    <p className='mb-2 text-xs text-gray-400'>
                      Quick start with default description:
                    </p>
                    <div
                      className='cursor-pointer rounded-lg border-2 border-dashed border-blue-500 bg-blue-500/10 p-4 transition-all duration-200 hover:border-blue-400 hover:bg-blue-500/20'
                      onClick={() => handleDefaultTextClick(callResultSuggestions[callResult])}
                    >
                      <div className='flex items-start gap-3'>
                        <div>
                          <p className='mb-1 text-sm font-medium text-gray-200'>
                            Default Description for "{callResult}"
                          </p>
                          <p className='text-sm leading-relaxed text-gray-300'>
                            {callResultSuggestions[callResult]}
                          </p>
                          <p className='mt-2 text-xs text-blue-400'>
                            Click to use this description
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <textarea
                  id='callDescription'
                  rows='4'
                  className='w-full resize-none rounded-lg border border-gray-600 bg-gray-600 p-3 text-sm text-gray-100 placeholder-gray-400 transition-colors focus:border-orange-400 focus:ring-1 focus:ring-orange-400 focus:outline-none'
                  placeholder={
                    callResult
                      ? noDefaultResults.includes(callResult)
                        ? 'Please provide detailed description...'
                        : showDefaultContainer
                          ? 'Or type your own description below...'
                          : 'Type your description here...'
                      : 'Select a call result first...'
                  }
                  {...register('callDescription', { required: true })}
                ></textarea>
                {errors.callDescription && (
                  <span className='mt-1 text-xs text-red-500'>This field is required</span>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Submit Button - Fixed at Bottom */}
        <button
          type='submit'
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
          className='w-full rounded-lg bg-orange-500 py-3 text-sm text-white transition-colors duration-200 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {loading ? 'Submitting...' : 'Submit All Information'}
        </button>
      </div>

      {/* Availability Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          showAvailabilityDrawer ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
        }`}
      >
        {/* Backdrop with fade-in animation */}
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${
            showAvailabilityDrawer ? 'bg-opacity-50' : 'bg-opacity-0'
          }`}
          onClick={toggleAvailabilityDrawer}
        ></div>

        {/* Drawer with slide-in animation */}
        <div
          className={`fixed inset-y-0 right-0 w-full transform transition-transform duration-300 ease-in-out ${
            showAvailabilityDrawer ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className='flex h-full flex-col bg-gray-800 p-6 shadow-xl'>
            <div className='flex items-center justify-between'>
              <span className='text-lg text-gray-200'>Set Owner Availability</span>
              <button
                onClick={toggleAvailabilityDrawer}
                className='rounded-lg p-2 text-gray-400 transition-colors duration-200 hover:bg-gray-700 hover:text-gray-200'
              >
                <svg className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>

            <div className='flex-1 overflow-y-auto py-4'>
              <div className='space-y-2'>
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className='rounded-lg border border-gray-600 bg-gray-700 p-4 shadow-sm'
                  >
                    <div
                      className='flex cursor-pointer items-center justify-between'
                      onClick={() => setOpenDay(openDay === day ? null : day)}
                    >
                      <span className='font-semibold text-gray-200'>{day}</span>
                      <svg
                        className={`h-5 w-5 transform transition-transform duration-200 ${
                          openDay === day ? 'rotate-180' : ''
                        }`}
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
                      <div className='mt-4 space-y-2'>
                        {availability[day].length === 0 ? (
                          <p className='text-sm text-gray-400 italic'>No time slots added</p>
                        ) : (
                          availability[day].map((slot, slotIndex) => (
                            <div
                              key={slotIndex}
                              className='flex items-center gap-3 rounded-lg bg-gray-600 p-2'
                            >
                              <div className='flex flex-1 items-center gap-3'>
                                <div className='flex items-center gap-2'>
                                  <label className='text-sm font-medium text-gray-300'>From:</label>
                                  <input
                                    type='time'
                                    value={slot.start}
                                    onChange={(e) =>
                                      handleTimeChange(day, slotIndex, 'start', e.target.value)
                                    }
                                    className='rounded border border-gray-500 bg-gray-500 px-3 py-2 text-sm text-white focus:border-orange-400 focus:ring-1 focus:ring-orange-400 focus:outline-none'
                                  />
                                </div>
                                <div className='flex items-center gap-2'>
                                  <label className='text-sm font-medium text-gray-300'>To:</label>
                                  <input
                                    type='time'
                                    value={slot.end}
                                    onChange={(e) =>
                                      handleTimeChange(day, slotIndex, 'end', e.target.value)
                                    }
                                    className='rounded border border-gray-500 bg-gray-500 px-3 py-2 text-sm text-white focus:border-orange-400 focus:ring-1 focus:ring-orange-400 focus:outline-none'
                                  />
                                </div>
                              </div>
                              <button
                                type='button'
                                onClick={() => removeTimeSlot(day, slotIndex)}
                                className='rounded-lg bg-red-500/20 p-2 transition-colors duration-200 hover:bg-red-500/30'
                              >
                                <img src={deleteIcon} alt='Delete' className='h-4 w-4' />
                              </button>
                            </div>
                          ))
                        )}

                        <button
                          type='button'
                          onClick={() => addTimeSlot(day)}
                          className='flex items-center gap-2 rounded-lg border border-dashed border-gray-500 bg-gray-600 px-4 py-2 text-sm font-medium text-gray-300 transition-colors duration-200 hover:bg-gray-500 hover:text-white'
                        >
                          <img src={plusIcon} alt='Add' className='h-4 w-4' />
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className='flex gap-3'>
              <button
                onClick={toggleAvailabilityDrawer}
                className='flex-1 rounded-lg border border-gray-500 bg-gray-700 px-4 py-2 font-medium text-gray-300 transition-colors duration-200 hover:bg-gray-600 hover:text-white'
              >
                Cancel
              </button>
              <button
                onClick={handleAvailabilitySubmit}
                className='flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-blue-700'
              >
                Save Availability
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseHistory;
