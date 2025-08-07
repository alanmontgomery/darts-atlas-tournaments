import React from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaBuilding,
  FaTrophy,
  FaInfoCircle,
  FaExternalLinkAlt,
} from "react-icons/fa";

const TournamentCard = ({ tournament }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
      {/* Header */}

      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white flex flex-col items-start justify-center min-h-32">
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex-1 flex items-center justify-between w-full">
            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-100 transition-colors">
              {tournament.name || `Tournament ${tournament.id}`}
            </h3>
            {tournament.status && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                <FaInfoCircle className="mr-1" />
                {tournament.status}
              </span>
            )}
          </div>
          {tournament.link && (
            <a
              href={`https://www.dartsatlas.com${tournament.link}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition-colors"
            >
              <FaExternalLinkAlt className="text-lg" />
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tournament.date && (
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <FaCalendarAlt className="text-blue-500 text-lg flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Date</p>
                <p className="text-sm text-gray-600">
                  {tournament.fullDate || formatDate(tournament.date)}
                </p>
              </div>
            </div>
          )}

          {tournament.time && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <FaClock className="text-green-500 text-lg flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Time</p>
                <p className="text-sm text-gray-600">{tournament.time}</p>
              </div>
            </div>
          )}
        </div>

        {/* Venue Information */}
        {(tournament.venue || tournament.venueAddress) && (
          <div className="space-y-2">
            {tournament.venue && (
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <FaBuilding className="text-purple-500 text-lg flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Venue</p>
                  <p className="text-sm text-gray-600">{tournament.venue}</p>
                </div>
              </div>
            )}

            {tournament.venueAddress && (
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <FaMapMarkerAlt className="text-orange-500 text-lg flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Address</p>
                  <p className="text-sm text-gray-600">
                    {tournament.venueAddress}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Location (fallback) */}
        {tournament.location && !tournament.venue && (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <FaMapMarkerAlt className="text-gray-500 text-lg flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">Location</p>
              <p className="text-sm text-gray-600">{tournament.location}</p>
            </div>
          </div>
        )}

        {/* Structure */}
        {tournament.structure && (
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
            <FaTrophy className="text-yellow-500 text-lg flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">Structure</p>
              <p className="text-sm text-gray-600">{tournament.structure}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentCard;
