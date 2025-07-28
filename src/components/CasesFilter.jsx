
import React, { useState, useEffect } from 'react';
import calendarImg from '../images/calendar.png';
import arrowleftImg from '../images/arrow-left.png';
import arrowrightImg from '../images/arrow-right.png';

const CasesFilter = ({
  isDarkMode,
  onClose,
  onApply = () => {}, // onApply will be called when the user clicks 'Apply'
  initialSelectedDate = null // Prop to receive the currently selected date from parent
}) => {
  // State for the selected date (or date range)
  const [tempSelectedDate, setTempSelectedDate] = useState(initialSelectedDate); // Use temp state for internal selection
  // Use a single Date object to manage the displayed month and year for consistency
  const [displayDate, setDisplayDate] = useState(initialSelectedDate || new Date());

  // Effect to synchronize internal state with initialSelectedDate prop
  useEffect(() => {
    setTempSelectedDate(initialSelectedDate);
    // When initialSelectedDate changes, update displayDate to match it
    // If initialSelectedDate is null, default to current date
    setDisplayDate(initialSelectedDate || new Date());
  }, [initialSelectedDate]);

  // Function to get the number of days in a month for a given date
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Function to get the first day of the month (0 for Sunday, 1 for Monday, etc.) for a given date
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(displayDate);
  const firstDayOfMonth = getFirstDayOfMonth(displayDate);

  const days = [];
  // Fill leading empty days
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Fill days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrevMonth = () => {
    setDisplayDate(prevDisplayDate => {
      const newDate = new Date(prevDisplayDate.getFullYear(), prevDisplayDate.getMonth() - 1, 1);
      // If a date was selected and it was in the previously displayed month,
      // update tempSelectedDate to reflect the new month/year, keeping the day if valid.
      // This prevents the selected day from "disappearing" if you navigate months.
      if (tempSelectedDate &&
          tempSelectedDate.getMonth() === prevDisplayDate.getMonth() &&
          tempSelectedDate.getFullYear() === prevDisplayDate.getFullYear()) {
        setTempSelectedDate(new Date(newDate.getFullYear(), newDate.getMonth(), Math.min(tempSelectedDate.getDate(), getDaysInMonth(newDate))));
      }
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setDisplayDate(prevDisplayDate => {
      const newDate = new Date(prevDisplayDate.getFullYear(), prevDisplayDate.getMonth() + 1, 1);
      // If a date was selected and it was in the previously displayed month,
      // update tempSelectedDate to reflect the new month/year, keeping the day if valid.
      if (tempSelectedDate &&
          tempSelectedDate.getMonth() === prevDisplayDate.getMonth() &&
          tempSelectedDate.getFullYear() === prevDisplayDate.getFullYear()) {
        setTempSelectedDate(new Date(newDate.getFullYear(), newDate.getMonth(), Math.min(tempSelectedDate.getDate(), getDaysInMonth(newDate))));
      }
      return newDate;
    });
  };

  const handleDateClick = (day) => {
    if (day) {
      setTempSelectedDate(new Date(displayDate.getFullYear(), displayDate.getMonth(), day));
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div
      className={`w-72 rounded-md shadow-lg p-4 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      {/* "Select date" Box (gray-700) */}
      <div className={`p-3 rounded-md mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <div className={`w-full px-3 py-2 rounded-md flex items-center justify-center gap-2 ${
          isDarkMode ? 'bg-transparent text-white' : 'bg-gray-200 text-gray-900'
        }`}>
          <img src={calendarImg} alt="Calendar Icon" className="w-5 h-5" />
          <span className="text-center flex-grow">
            {tempSelectedDate ? tempSelectedDate.toLocaleDateString('en-GB') : 'Select date'}
          </span>
        </div>
      </div>

      {/* Calendar Grid Box (gray-700) */}
      <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handlePrevMonth}
            className={`p-2 rounded-full ${isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'}`}
          >
            <img src={arrowleftImg} alt="Previous Month" className="w-5 h-5" />
          </button>
          <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {monthNames[displayDate.getMonth()]} {displayDate.getFullYear()}
          </span>
          <button
            onClick={handleNextMonth}
            className={`p-2 rounded-full ${isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'}`}
          >
            <img src={arrowrightImg} alt="Next Month" className="w-5 h-5" />
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 text-center text-sm font-medium py-2">
          {dayNames.map(day => (
            <span key={day} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 p-2">
          {days.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              disabled={!day}
              className={`w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors
                ${day ? (tempSelectedDate && tempSelectedDate.getDate() === day && tempSelectedDate.getMonth() === displayDate.getMonth() && tempSelectedDate.getFullYear() === displayDate.getFullYear()
                  ? 'bg-blue-600 text-white'
                  : `${isDarkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-900 hover:bg-gray-200'}`
                ) : 'text-gray-500 cursor-default'}
                ${!day ? 'opacity-0' : ''}
              `}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Action Buttons for Date Picker */}
        <div className="flex justify-between pt-4">
          {/* Apply Button (now on left) */}
          <button
            onClick={() => onApply(tempSelectedDate)} // Pass the temp selected date to onApply
            className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Apply
          </button>
          {/* Cancel Button (now on right) */}
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-300'
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CasesFilter;
