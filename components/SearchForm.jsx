import React from 'react';
import { 
  FaSearch, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaCog, 
  FaChevronDown,
  FaChevronUp 
} from 'react-icons/fa';

const SearchForm = ({ 
  searchParams, 
  onInputChange, 
  onDateChange, 
  onSubmit, 
  isLoading, 
  showAdvanced, 
  onToggleAdvanced 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      {/* Date Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FaCalendarAlt className="mr-2 text-blue-500" />
            Search by Date
          </label>
          <input
            type="date"
            name="date"
            value={searchParams.date}
            onChange={onDateChange}
            className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            <FaSearch className="text-sm" />
            <span>{isLoading ? "Searching..." : "Search"}</span>
          </button>
          <button
            onClick={onToggleAdvanced}
            className="flex items-center space-x-2 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 transition-all duration-200 shadow-lg"
          >
            <FaCog className="text-sm" />
            <span>{showAdvanced ? "Hide Advanced" : "Advanced Search"}</span>
            {showAdvanced ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
          </button>
        </div>
      </div>

      {/* Advanced Search Form */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaCog className="mr-2 text-gray-500" />
            Advanced Search Options
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tournament Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tournament Name
              </label>
              <input
                type="text"
                name="name"
                value={searchParams.name}
                onChange={onInputChange}
                placeholder="Enter tournament name..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-gray-500" />
                Location
              </label>
              <input
                type="text"
                name="location"
                value={searchParams.location}
                onChange={onInputChange}
                placeholder="e.g., London, UK"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
              />
            </div>

            {/* Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Radius
              </label>
              <select
                name="radius"
                value={searchParams.radius}
                onChange={onInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
              >
                <option value="">Any distance</option>
                <option value="25">25 miles</option>
                <option value="50">50 miles</option>
                <option value="100">100 miles</option>
              </select>
            </div>

            {/* Structure */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Structure
              </label>
              <select
                name="structure"
                value={searchParams.structure}
                onChange={onInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
              >
                <option value="">Any structure</option>
                <option value="knockout">Knockout</option>
                <option value="round-robin">Round-Robin</option>
                <option value="league">League</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchForm;
