import { NextResponse } from "next/server";
import DartsAtlasScraper from "../../../scripts/scraper.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      searchParams,
      saveResults = true,
      filename,
      scrapeAllPages = false,
      maxPages = 10,
      useCache = true,
      forceRefresh = false,
      page = 1,
    } = body;

    console.log("🚀 Starting scraper via API...");

    // Set a timeout for the entire scraping operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("Scraping timeout - operation took too long")),
        300000
      ); // 5 minutes
    });

    const scraper = new DartsAtlasScraper();

    // Run scraper with timeout
    const results = await Promise.race([
      scraper.scrape({
        searchParams,
        saveResults,
        filename,
        scrapeAllPages,
        maxPages,
        page,
      }),
      timeoutPromise,
    ]);

    if (results.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully scraped ${results.totalCount} tournaments`,
        data: results,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: results.error,
          message: "Scraping failed",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ API Error:", error);

    // Handle specific error types
    let errorMessage = error.message;
    let statusCode = 500;

    if (
      error.message.includes("socket hang up") ||
      error.message.includes("ECONNRESET")
    ) {
      errorMessage = "Connection lost. Please try again.";
      statusCode = 503;
    } else if (error.message.includes("timeout")) {
      errorMessage = "Request timed out. Please try again.";
      statusCode = 408;
    } else if (error.message.includes("ENOTFOUND")) {
      errorMessage =
        "Unable to reach the target website. Please check your internet connection.";
      statusCode = 503;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: "Internal server error",
      },
      { status: statusCode }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Darts Atlas Scraper API",
    endpoints: {
      POST: "/api/scrape - Start scraping with optional search parameters",
      GET: "/api/scrape - Get API information",
    },
    features: {
      dateSearch: "Support for date-based search using 'date' parameter",
      pagination: "Support for multi-page scraping",
      caching: "LocalStorage caching with automatic refresh",
      searchParams:
        "Advanced search with name, location, radius, date, structure",
    },
    example: {
      method: "POST",
      body: {
        searchParams: {
          name: "Open",
          location: "London",
          radius: "50mi",
          date: "2025-08-08",
          structure: "Knockout",
        },
        scrapeAllPages: true,
        maxPages: 5,
        saveResults: true,
        filename: "custom-filename.json",
      },
    },
  });
}
