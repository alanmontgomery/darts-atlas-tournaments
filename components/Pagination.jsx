import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  isLoading,
  totalResults 
}) => {
  if (!totalPages || totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is 5 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination
      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 1; i <= maxVisible; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  return (
    <div className="mt-8">
      {/* Pagination Controls */}
      <div className="flex justify-center">
        <nav className="flex items-center space-x-2" aria-label="Pagination">
          {/* Previous Page Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
          >
            <FaChevronLeft className="text-xs" />
            <span>Previous</span>
          </button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {getPageNumbers().map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                disabled={isLoading}
                className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                  currentPage === pageNumber
                    ? "bg-blue-500 text-white border border-blue-200"
                    : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {pageNumber}
              </button>
            ))}
          </div>

          {/* Next Page Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
          >
            <span>Next</span>
            <FaChevronRight className="text-xs" />
          </button>
        </nav>
      </div>

      {/* Page Info */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center space-x-4 px-6 py-3 bg-white rounded-xl border border-gray-200">
          <span className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          {totalResults > 0 && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-600">
                {totalResults} total tournaments
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pagination;
