import React from "react";
import { FaCheckCircle, FaSync, FaClock } from "react-icons/fa";

const CacheStatus = ({ lastUpdated, onRefresh, isLoading }) => {
  if (!lastUpdated) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <FaCheckCircle className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-green-800 flex items-center">
              <FaClock className="mr-2" />
              Data loaded from cache
            </h3>
            <div className="mt-1 text-sm text-green-700">
              Last updated: {formatDate(lastUpdated)}
            </div>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
        >
          <FaSync className={`text-sm ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>
    </div>
  );
};

export default CacheStatus;
