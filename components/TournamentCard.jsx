import React from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaBuilding,
  FaTrophy,
  FaInfoCircle,
  FaExternalLinkAlt,
  FaUsers,
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
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden group hover:border-gray-300 transition-all duration-200 hover:scale-[1.02]">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-100 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors max-h-40">
              {tournament.name || `Tournament ${tournament.id}`}
            </h3>
            {tournament.status && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                <FaInfoCircle className="mr-1.5 text-blue-500" />
                {tournament.status}
              </span>
            )}
          </div>
          {tournament.link && (
            <a
              href={`https://www.dartsatlas.com${tournament.link}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-blue-50 cursor-pointer"
            >
              <FaExternalLinkAlt className="text-lg" />
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tournament.date && (
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="text-blue-600 text-lg" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Date
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {tournament.fullDate || formatDate(tournament.date)}
                </p>
              </div>
            </div>
          )}

          {tournament.time && (
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FaClock className="text-green-600 text-lg" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Time
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {tournament.time}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Venue Information */}
        {(tournament.venue || tournament.venueAddress) && (
          <div className="space-y-3">
            {tournament.venue && (
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FaBuilding className="text-purple-600 text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Venue
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {tournament.venue}
                  </p>
                </div>
              </div>
            )}

            {tournament.venueAddress && (
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FaMapMarkerAlt className="text-orange-600 text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Address
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {tournament.venueAddress}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Location (fallback) */}
        {tournament.location && !tournament.venue && (
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FaMapMarkerAlt className="text-gray-600 text-lg" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Location
              </p>
              <p className="text-sm font-medium text-gray-900">
                {tournament.location}
              </p>
            </div>
          </div>
        )}

        {/* Structure */}
        {tournament.structure && (
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FaTrophy className="text-yellow-600 text-lg" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Structure
              </p>
              <p className="text-sm font-medium text-gray-900">
                {tournament.structure}
              </p>
            </div>
          </div>
        )}

        {/* Entries Count */}
        {tournament.entriesCount !== undefined && (
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FaUsers className="text-indigo-600 text-lg" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Entries
              </p>
              <p className="text-sm font-medium text-gray-900">
                {tournament.entriesCount}{" "}
                {tournament.entriesCount === 1 ? "player" : "players"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer with View Entries Button */}
      {tournament.link && (
        <div className="px-6 pb-6">
          <a
            href={`https://www.dartsatlas.com${tournament.link}/entries`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center space-x-2 bg-indigo-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-indigo-600 transition-all duration-200 border border-indigo-200 cursor-pointer"
          >
            <FaUsers className="text-sm" />
            <span>View Entries</span>
            {tournament.entriesCount !== undefined && (
              <span className="bg-indigo-600 px-2 py-1 rounded-lg text-xs">
                {tournament.entriesCount}
              </span>
            )}
          </a>
        </div>
      )}
    </div>
  );
};

export default TournamentCard;
