import React from 'react';
import { FaTrophy, FaInfoCircle, FaClock } from 'react-icons/fa';

const ResultsHeader = ({ results, paginationInfo, isLoading }) => {
  if (!results) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-xl border border-blue-200">
            <FaTrophy className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              Tournament Results
              {isLoading && (
                <FaClock className="ml-2 text-blue-500 animate-spin" />
              )}
            </h2>
            <p className="text-gray-600 mt-1">
              {results.totalCount} tournaments found
              {paginationInfo && paginationInfo.totalPages > 1 && (
                <span className="ml-2 text-blue-600 font-medium">
                  • {paginationInfo.totalPages} pages available
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4">
          {paginationInfo && paginationInfo.totalResults > 0 && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
              <FaInfoCircle className="text-blue-500" />
              <span className="text-sm font-medium text-blue-700">
                {paginationInfo.totalResults} total tournaments
              </span>
            </div>
          )}
          
          {paginationInfo && paginationInfo.currentPage && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-xl border border-green-100">
              <FaClock className="text-green-500" />
              <span className="text-sm font-medium text-green-700">
                Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsHeader;
