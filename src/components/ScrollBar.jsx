import React from 'react';

// This component will apply a custom scrollbar style globally or locally as needed.
const ScrollBar = () => {
  return (
    <style jsx global>{`
      /* Global Scrollbar Styling */
      ::-webkit-scrollbar {
        width: 8px;
      }

      ::-webkit-scrollbar-track {
        background: #374151;
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb {
        background: #6b7280;
        border-radius: 4px;
        transition: background 0.2s ease;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
      }

      /* For Firefox */
      * {
        scrollbar-width: thin;
        scrollbar-color: #6b7280 #374151;
      }
    `}</style>
  );
};

export default ScrollBar;
