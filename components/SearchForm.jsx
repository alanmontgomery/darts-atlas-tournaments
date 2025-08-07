import React from "react";
import {
  FaSearch,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCog,
  FaChevronDown,
  FaChevronUp,
  FaUsers,
} from "react-icons/fa";

const SearchForm = ({
  searchParams,
  onInputChange,
  onDateChange,
  onSubmit,
  isLoading,
  showAdvanced,
  onToggleAdvanced,
  includeEntries = false,
  onToggleEntries,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
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
            className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-blue-200 cursor-pointer"
          >
            <FaSearch className="text-sm" />
            <span>{isLoading ? "Searching..." : "Search"}</span>
          </button>
          <button
            onClick={onToggleAdvanced}
            className="flex items-center space-x-2 bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 transition-all duration-200 border border-gray-200 cursor-pointer"
          >
            <FaCog className="text-sm" />
            <span>{showAdvanced ? "Hide Advanced" : "Advanced Search"}</span>
            {showAdvanced ? (
              <FaChevronUp className="text-xs" />
            ) : (
              <FaChevronDown className="text-xs" />
            )}
          </button>
        </div>
      </div>

      {/* Entries Toggle */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaUsers className="text-indigo-500" />
            <div>
              <label className="text-sm font-medium text-gray-700">
                Include Entries Data
              </label>
              <p className="text-xs text-gray-500">
                Fetch player entry counts for each tournament (slower but more
                detailed)
              </p>
            </div>
          </div>
          <button
            onClick={onToggleEntries}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              includeEntries ? "bg-indigo-500" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                includeEntries ? "translate-x-6" : "translate-x-1"
              }`}
            />
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Any distance</option>
                <option value="5">5 miles</option>
                <option value="10">10 miles</option>
                <option value="25">25 miles</option>
                <option value="50">50 miles</option>
                <option value="100">100 miles</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={searchParams.status}
                onChange={onInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Any status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchForm;
