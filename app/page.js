"use client";

import { useState, useEffect } from "react";
import { FaBullseye, FaSearch, FaCog } from "react-icons/fa";
import TournamentCard from "@/components/TournamentCard";
import Pagination from "@/components/Pagination";
import SearchForm from "@/components/SearchForm";
import ResultsHeader from "@/components/ResultsHeader";
import CacheStatus from "@/components/CacheStatus";
import ErrorDisplay from "@/components/ErrorDisplay";

export default function Home() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState(null);
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [includeEntries, setIncludeEntries] = useState(false);
  const [searchParams, setSearchParams] = useState({
    date: "",
    name: "",
    location: "",
    radius: "",
    status: "",
  });

  const [lastUpdated, setLastUpdated] = useState(null);

  // Load cached data on component mount
  useEffect(() => {
    const hasCachedData = loadCachedData();
    if (!hasCachedData && !isLoading && !results) {
      loadInitialData();
    }
  }, []);

  const loadCachedData = () => {
    try {
      const cached = localStorage.getItem("dartsAtlasData");
      if (cached) {
        const data = JSON.parse(cached);
        setResults(data);
        setPaginationInfo(data.paginationInfo);
        setCurrentPage(data.paginationInfo?.currentPage || 1);
        setLastUpdated(data.lastUpdated || new Date().toISOString());
        return true;
      }
    } catch (error) {
      console.log("No cached data found or error loading cache");
    }
    return false;
  };

  const saveToCache = (data) => {
    try {
      const cacheData = {
        ...data,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem("dartsAtlasData", JSON.stringify(cacheData));
    } catch (error) {
      console.log("Error saving to cache:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (e) => {
    setSearchParams((prev) => ({
      ...prev,
      date: e.target.value,
    }));
  };

  const loadPage = async (pageNumber) => {
    setIsLoading(true);
    setError(null);

    try {
      const cleanParams = Object.fromEntries(
        Object.entries(searchParams).filter(([_, value]) => value.trim() !== "")
      );

      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          searchParams: cleanParams,
          saveResults: true,
          scrapeAllPages: false,
          maxPages: 1,
          page: pageNumber,
          includeEntries,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.data);
        setPaginationInfo(data.data.paginationInfo);
        setCurrentPage(pageNumber);
        saveToCache(data.data);
      } else {
        setError(data.error || "Failed to load page");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    loadPage(pageNumber);
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          searchParams: {},
          saveResults: true,
          scrapeAllPages: false,
          maxPages: 1,
          includeEntries,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.data);
        setPaginationInfo(data.data.paginationInfo);
        setCurrentPage(data.data.paginationInfo?.currentPage || 1);
        saveToCache(data.data);
      } else {
        setError(data.error || "Failed to load initial data");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults(null);
    setCurrentPage(1);

    try {
      const cleanParams = Object.fromEntries(
        Object.entries(searchParams).filter(([_, value]) => value.trim() !== "")
      );

      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          searchParams: cleanParams,
          saveResults: true,
          scrapeAllPages: false,
          maxPages: 1,
          includeEntries,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.data);
        setPaginationInfo(data.data.paginationInfo);
        setCurrentPage(data.data.paginationInfo?.currentPage || 1);
        saveToCache(data.data);
      } else {
        setError(data.error || "Search failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleToggleEntries = () => {
    setIncludeEntries(!includeEntries);
  };

  console.log(results);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl border border-blue-200">
              <FaBullseye className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                Darts Atlas Tournament Scraper
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover and explore darts tournaments with advanced search
                capabilities and real-time data
              </p>
            </div>
          </div>
        </header>

        {/* Search Form */}
        <SearchForm
          searchParams={searchParams}
          onInputChange={handleInputChange}
          onDateChange={handleDateChange}
          onSubmit={handleSearch}
          isLoading={isLoading}
          showAdvanced={showSearchForm}
          onToggleAdvanced={() => setShowSearchForm(!showSearchForm)}
          includeEntries={includeEntries}
          onToggleEntries={handleToggleEntries}
        />

        {/* Cache Status */}
        <CacheStatus
          lastUpdated={lastUpdated}
          onRefresh={loadInitialData}
          isLoading={isLoading}
        />

        {/* Error Display */}
        <ErrorDisplay error={error} onDismiss={handleDismissError} />

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Results Header */}
            <ResultsHeader
              results={results}
              paginationInfo={paginationInfo}
              isLoading={isLoading}
            />

            {/* Tournament Cards */}
            {results.tournaments && results.tournaments.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {results.tournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>
            ) : !isLoading && !error ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 border border-gray-200">
                  <FaSearch className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No tournaments found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or date range.
                </p>
              </div>
            ) : null}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={paginationInfo?.totalPages || 1}
              onPageChange={handlePageChange}
              isLoading={isLoading}
              totalResults={paginationInfo?.totalResults || 0}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && !results && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 border border-blue-200">
              <FaCog className="text-blue-500 text-2xl animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Loading tournaments...
            </h3>
            <p className="text-gray-600">
              Please wait while we fetch the latest tournament data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
