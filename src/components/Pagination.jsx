import React from 'react';
import PropTypes from 'prop-types';

const Pagination = ({ currentPage, totalPages, onPageChange, isDarkMode }) => {
  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const maxVisiblePages = 5;
  const half = Math.floor(maxVisiblePages / 2);

  let startPage, endPage;

  if (totalPages <= maxVisiblePages) {
    startPage = 1;
    endPage = totalPages;
  } else {
    startPage = Math.max(1, currentPage - half);
    endPage = Math.min(totalPages, currentPage + half);

    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }
  }

  const getButtonClass = (isActive = false, isDisabled = false) => {
    let base = `text-sm px-2 py-1 mx-0.5 rounded ${
      isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-300 text-gray-900'
    }`;

    if (isActive) {
      base += ` font-bold ${isDarkMode ? 'bg-gray-600' : 'bg-gray-400'}`;
    } else if (!isDisabled) {
      base += ' hover:bg-gray-400 cursor-pointer';
    }

    if (isDisabled) {
      base += ' opacity-50 cursor-not-allowed';
    }

    return base;
  };

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`flex justify-start items-center p-2 ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900'
      }`}
      style={{ gap: '0.25rem' }} // small gap between buttons
    >
      {/* Previous Button */}
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
        className={getButtonClass(false, currentPage === 1)}
        style={{ minWidth: '28px' }}
      >
        &lt;
      </button>

      {/* First Page */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => handlePageClick(1)}
            className={getButtonClass(currentPage === 1)}
            aria-current={currentPage === 1 ? 'page' : undefined}
            aria-label={`Go to page 1`}
            style={{ minWidth: '28px' }}
          >
            1
          </button>

          {startPage > 2 && (
            <span
              className="select-none text-sm px-2"
              aria-hidden="true"
              style={{ minWidth: '20px', textAlign: 'center' }}
            >
              &hellip;
            </span>
          )}
        </>
      )}

      {/* Visible Page Numbers */}
      {[...Array(endPage - startPage + 1).keys()].map((index) => {
        const page = startPage + index;
        return (
          <button
            key={page}
            onClick={() => handlePageClick(page)}
            className={getButtonClass(currentPage === page)}
            aria-current={currentPage === page ? 'page' : undefined}
            aria-label={`Go to page ${page}`}
            aria-disabled={currentPage === page}
            tabIndex={currentPage === page ? -1 : 0}
            style={{ minWidth: '28px' }}
          >
            {page}
          </button>
        );
      })}

      {/* Ellipsis after visible pages */}
      {endPage < totalPages - 1 && (
        <span
          className="select-none text-sm px-2"
          aria-hidden="true"
          style={{ minWidth: '20px', textAlign: 'center' }}
        >
          &hellip;
        </span>
      )}

      {/* Last Page */}
      {endPage < totalPages && (
        <button
          onClick={() => handlePageClick(totalPages)}
          className={getButtonClass(currentPage === totalPages)}
          aria-current={currentPage === totalPages ? 'page' : undefined}
          aria-label={`Go to page ${totalPages}`}
          style={{ minWidth: '28px' }}
        >
          {totalPages}
        </button>
      )}

      {/* Next Button */}
      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
        className={getButtonClass(false, currentPage === totalPages)}
        style={{ minWidth: '28px' }}
      >
        &gt;
      </button>
    </nav>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  isDarkMode: PropTypes.bool,
};

Pagination.defaultProps = {
  isDarkMode: false,
};

export default Pagination;
