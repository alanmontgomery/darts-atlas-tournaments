import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const ErrorDisplay = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <FaExclamationTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800 flex items-center justify-between">
            <span>Error occurred</span>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            )}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            {error}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
