const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs").promises;
const path = require("path");

class DartsAtlasScraper {
  constructor() {
    this.baseUrl = "https://www.dartsatlas.com/search?scope=tournaments";
    this.session = axios.create({
      timeout: 30000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Upgrade-Insecure-Requests": "1",
      },
    });
  }

  async initialize() {
    console.log("🚀 Initializing Cheerio scraper...");
    console.log("✅ Scraper initialized successfully");
  }

  async testConnectivity() {
    console.log("🔍 Testing connectivity to Darts Atlas...");

    try {
      const response = await this.session.get(this.baseUrl, {
        timeout: 10000,
      });

      if (response.status === 200) {
        console.log("✅ Website is accessible");
        return true;
      } else {
        console.log(`⚠️ Website returned status: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log("⚠️ Connectivity test failed:", error.message);
      return false;
    }
  }

  async fetchPage(url = this.baseUrl) {
    console.log("🌐 Fetching page from Darts Atlas...");

    try {
      const response = await this.session.get(url);

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log("✅ Successfully fetched the page");
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch page:", error.message);
      throw error;
    }
  }

  async extractTournaments(html) {
    console.log("🔍 Extracting tournament data...");

    const $ = cheerio.load(html);
    const tournaments = [];

    // Helper function to extract text from elements
    const extractText = (element, selectors) => {
      const selectorList = selectors.split(", ");
      for (const selector of selectorList) {
        const found = element.find(selector);
        if (found.length > 0) {
          return found.first().text().trim();
        }
      }
      return "";
    };

    // Helper function to extract attribute value
    const extractAttribute = (element, selector, attribute) => {
      const found = element.find(selector);
      return found.length > 0 ? found.first().attr(attribute) || "" : "";
    };

    // Helper function to extract date from calendar event icon
    const extractDateFromCalendarIcon = (element) => {
      const calendarIcon = element.find(".calendar-event-icon");
      if (calendarIcon.length > 0) {
        const spans = calendarIcon.find("span");
        if (spans.length >= 3) {
          const day = spans.eq(0).text().trim();
          const month = spans.eq(1).text().trim();
          const date = spans.eq(2).text().trim();

          // Construct a proper date string
          const currentYear = new Date().getFullYear();
          const monthMap = {
            Jan: "01",
            Feb: "02",
            Mar: "03",
            Apr: "04",
            May: "05",
            Jun: "06",
            Jul: "07",
            Aug: "08",
            Sep: "09",
            Oct: "10",
            Nov: "11",
            Dec: "12",
          };

          const monthNum = monthMap[month] || "01";
          const dateStr = `${currentYear}-${monthNum}-${date.padStart(2, "0")}`;

          return {
            day,
            month,
            date: dateStr,
            fullDate: `${day} ${month} ${date}`,
          };
        }
      }
      return null;
    };

    // Helper function to extract venue information
    const extractVenueInfo = (element) => {
      const venueEmbed = element.find(".venue-embed");
      if (venueEmbed.length > 0) {
        const venueLink = venueEmbed.find("a");
        const venueName = venueLink.text().trim();
        const venueUrl = venueLink.attr("href") || "";

        // Extract address (everything after the venue name)
        const venueText = venueEmbed.text().trim();
        const venueNameInText = venueName;
        let address = venueText.replace(venueNameInText, "").trim();

        // Clean up the address by removing extra whitespace and newlines
        address = address.replace(/\s+/g, " ").trim();

        return {
          name: venueName,
          url: venueUrl,
          address: address,
          fullAddress: venueText,
        };
      }
      return null;
    };

    // Try multiple selectors to find tournament elements
    let elements = [];
    const selectors = [
      "section.event",
      '[data-testid*="tournament"]',
      ".tournament-item",
      ".search-result-item",
      'div[class*="tournament"]',
      'div[class*="event"]',
      ".card",
      ".item",
      ".search-result",
      '[class*="result"]',
      "article",
      "section",
    ];

    for (const selector of selectors) {
      elements = $(selector);
      if (elements.length > 0) {
        console.log(
          `Found ${elements.length} elements with selector: ${selector}`
        );
        break;
      }
    }

    // If no specific tournament elements found, try to find any content that might be tournaments
    if (elements.length === 0) {
      elements = $("div, article, section");
      console.log(
        `No specific tournament elements found, trying general elements: ${elements.length}`
      );
    }

    // Filter out elements that are likely containers (too much content)
    elements = elements.filter((index, element) => {
      const $element = $(element);
      const textContent = $element.text().trim();
      const hasCalendarIcon = $element.find(".calendar-event-icon").length > 0;
      const hasVenueEmbed = $element.find(".venue-embed").length > 0;

      // Only include elements that have tournament-specific content
      return (
        textContent.length > 10 &&
        (hasCalendarIcon ||
          hasVenueEmbed ||
          textContent.includes("tournament") ||
          textContent.includes("event"))
      );
    });

    elements.each((index, element) => {
      try {
        const $element = $(element);

        // Skip elements that are too small or don't contain meaningful content
        const textContent = $element.text().trim();
        if (textContent.length < 10) return;

        // Extract date from calendar event icon (only within this element)
        const dateInfo = extractDateFromCalendarIcon($element);

        // Extract venue information (only within this element)
        const venueInfo = extractVenueInfo($element);

        const tournament = {
          id: index + 1,
          name: extractText(
            $element,
            'h1, h2, h3, h4, .title, .name, [class*="title"], [class*="name"], strong, b'
          ),
          location: extractText(
            $element,
            '.location, .venue, [class*="location"], [class*="venue"], .address'
          ),
          time: extractText(
            $element,
            '.date, .time, [class*="date"], [class*="time"], time'
          ),
          structure: extractText(
            $element,
            '.structure, .format, [class*="structure"], [class*="format"]'
          ),
          status: extractText(
            $element,
            '.status, .state, [class*="status"], [class*="state"]'
          ),
          description: extractText(
            $element,
            '.description, .details, [class*="description"], [class*="details"], p'
          ),
          link: extractAttribute($element, "a.tournament.event-link", "href"),
          image: extractAttribute($element, "img", "src"),
          rawHtml: $element.html() ? $element.html().substring(0, 500) : "", // Limit HTML size
        };

        // Add extracted date information
        if (dateInfo) {
          tournament.date = dateInfo.date;
          tournament.day = dateInfo.day;
          tournament.month = dateInfo.month;
          tournament.fullDate = dateInfo.fullDate;
        }

        // Add extracted venue information
        if (venueInfo) {
          tournament.venue = venueInfo.name;
          tournament.venueUrl = venueInfo.url;
          tournament.venueAddress = venueInfo.address;
          tournament.venueFullAddress = venueInfo.fullAddress;
        }

        // Only add if we have meaningful data
        if (
          tournament.name ||
          tournament.location ||
          tournament.time ||
          tournament.date ||
          tournament.venue ||
          textContent.length > 20
        ) {
          tournaments.push(tournament);
        }
      } catch (error) {
        console.log(`Error extracting tournament ${index + 1}:`, error);
      }
    });

    console.log(`✅ Extracted ${tournaments.length} tournaments`);
    return tournaments;
  }

  async searchTournaments(searchParams = {}) {
    console.log("🔍 Performing search with parameters:", searchParams);

    try {
      // Build search URL with query parameters
      const url = new URL(this.baseUrl);

      if (searchParams.name) {
        url.searchParams.append("name", searchParams.name);
      }

      if (searchParams.location) {
        url.searchParams.append("location", searchParams.location);
      }

      if (searchParams.radius) {
        url.searchParams.append("radius", searchParams.radius);
      }

      // Handle date parameter (new format)
      if (searchParams.date) {
        url.searchParams.append("date", searchParams.date);
      } else if (searchParams.startDate) {
        // Fallback to old format
        url.searchParams.append("startDate", searchParams.startDate);
      }

      if (searchParams.structure) {
        url.searchParams.append("structure", searchParams.structure);
      }

      const html = await this.fetchPage(url.toString());
      return await this.extractTournaments(html);
    } catch (error) {
      console.error("❌ Error during search:", error.message);
      return [];
    }
  }

  async getPaginationInfo(html) {
    console.log("📄 Getting pagination information...");

    const $ = cheerio.load(html);
    const paginationInfo = {
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
      totalResults: 0,
    };

    // Look for pagination elements
    const paginationSelectors = [
      ".pagination",
      ".pager",
      '[class*="pagination"]',
      '[class*="pager"]',
      'nav[aria-label*="pagination"]',
      'nav[aria-label*="pager"]',
    ];

    let paginationElement = null;
    for (const selector of paginationSelectors) {
      paginationElement = $(selector);
      if (paginationElement.length > 0) {
        console.log(`Found pagination with selector: ${selector}`);
        break;
      }
    }

    if (paginationElement.length > 0) {
      // Extract current page
      const currentPageElement = paginationElement.find(
        '.current, .active, [aria-current="page"]'
      );
      if (currentPageElement.length > 0) {
        const currentPageText = currentPageElement.text().trim();
        const currentPageMatch = currentPageText.match(/\d+/);
        if (currentPageMatch) {
          paginationInfo.currentPage = parseInt(currentPageMatch[0]);
        }
      }

      // Extract total pages
      const pageLinks = paginationElement.find(
        'a[href*="page"], a[href*="p="], .page-link, .pager-item'
      );
      if (pageLinks.length > 0) {
        const pageNumbers = [];
        pageLinks.each((i, el) => {
          const text = $(el).text().trim();
          const numberMatch = text.match(/\d+/);
          if (numberMatch) {
            pageNumbers.push(parseInt(numberMatch[0]));
          }
        });

        if (pageNumbers.length > 0) {
          paginationInfo.totalPages = Math.max(...pageNumbers);
        }
      }

      // Check for next/prev buttons
      const nextButton = paginationElement.find(
        '.next, .next-page, [aria-label*="next"], [rel="next"]'
      );
      const prevButton = paginationElement.find(
        '.prev, .prev-page, [aria-label*="previous"], [rel="prev"]'
      );

      paginationInfo.hasNextPage =
        nextButton.length > 0 && !nextButton.hasClass("disabled");
      paginationInfo.hasPrevPage =
        prevButton.length > 0 && !prevButton.hasClass("disabled");
    }

    // Try to extract total results count
    const resultsCountSelectors = [
      ".results-count",
      ".total-results",
      '[class*="results-count"]',
      '[class*="total-results"]',
      ".count",
      '[class*="count"]',
    ];

    for (const selector of resultsCountSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const text = element.text().trim();
        const countMatch = text.match(/(\d+)/);
        if (countMatch) {
          paginationInfo.totalResults = parseInt(countMatch[1]);
          break;
        }
      }
    }

    console.log("✅ Pagination information extracted:", paginationInfo);
    return paginationInfo;
  }

  async scrapePage(url, pageNumber = 1) {
    console.log(`📄 Scraping page ${pageNumber}...`);

    try {
      // Add page parameter if not page 1
      if (pageNumber > 1) {
        const pageUrl = new URL(url);
        pageUrl.searchParams.append("page", pageNumber.toString());
        url = pageUrl.toString();
      }

      const html = await this.fetchPage(url);
      const tournaments = await this.extractTournaments(html);
      const paginationInfo = await this.getPaginationInfo(html);

      return {
        tournaments,
        paginationInfo,
        pageNumber,
        url,
      };
    } catch (error) {
      console.error(`❌ Error scraping page ${pageNumber}:`, error.message);
      return {
        tournaments: [],
        paginationInfo: {
          currentPage: pageNumber,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
          totalResults: 0,
        },
        pageNumber,
        url,
        error: error.message,
      };
    }
  }

  async scrapeAllPages(searchParams = {}, maxPages = 10) {
    console.log(`🔍 Scraping all pages (max: ${maxPages})...`);

    const allTournaments = [];
    const allPages = [];
    let currentPage = 1;
    let hasMorePages = true;

    try {
      // Build initial search URL
      const url = new URL(this.baseUrl);

      if (searchParams.name) {
        url.searchParams.append("name", searchParams.name);
      }
      if (searchParams.location) {
        url.searchParams.append("location", searchParams.location);
      }
      if (searchParams.radius) {
        url.searchParams.append("radius", searchParams.radius);
      }
      if (searchParams.date) {
        url.searchParams.append("date", searchParams.date);
      } else if (searchParams.startDate) {
        url.searchParams.append("startDate", searchParams.startDate);
      }
      if (searchParams.structure) {
        url.searchParams.append("structure", searchParams.structure);
      }

      const baseUrl = url.toString();

      while (hasMorePages && currentPage <= maxPages) {
        console.log(`📄 Scraping page ${currentPage}...`);

        const pageResult = await this.scrapePage(baseUrl, currentPage);

        allPages.push(pageResult);
        allTournaments.push(...pageResult.tournaments);

        // Check if there are more pages
        if (
          pageResult.paginationInfo.hasNextPage &&
          currentPage < pageResult.paginationInfo.totalPages
        ) {
          currentPage++;
          // Add a small delay between requests
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          hasMorePages = false;
        }
      }

      console.log(
        `✅ Scraped ${currentPage} pages with ${allTournaments.length} total tournaments`
      );

      return {
        tournaments: allTournaments,
        pages: allPages,
        totalPages: currentPage,
        totalTournaments: allTournaments.length,
      };
    } catch (error) {
      console.error("❌ Error during multi-page scraping:", error.message);
      return {
        tournaments: allTournaments,
        pages: allPages,
        totalPages: currentPage,
        totalTournaments: allTournaments.length,
        error: error.message,
      };
    }
  }

  async getPageInfo(html) {
    console.log("📄 Getting page information...");

    const $ = cheerio.load(html);

    const pageInfo = {
      title: $("title").text().trim(),
      url: this.baseUrl,
      timestamp: new Date().toISOString(),
      totalResults:
        $(".results-count, .total-results").text().trim() || "Unknown",
      currentFilters: $(".filter, .active-filter")
        .map((i, el) => $(el).text().trim())
        .get(),
    };

    console.log("✅ Page information extracted");
    return pageInfo;
  }

  async saveResults(tournaments, filename = null) {
    if (!filename) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      filename = `darts-atlas-tournaments-${timestamp}.json`;
    }

    const results = {
      metadata: {
        scrapedAt: new Date().toISOString(),
        source: this.baseUrl,
        totalTournaments: tournaments.length,
      },
      tournaments: tournaments,
    };

    // const filepath = path.join(__dirname, "..", "data", filename);

    // Ensure data directory exists
    // await fs.mkdir(path.dirname(filepath), { recursive: true });

    // await fs.writeFile(filepath, JSON.stringify(results, null, 2));
    // console.log(`💾 Results saved to: ${filepath}`);

    // return filepath;
  }

  async close() {
    console.log("🔒 Scraper closed");
  }

  async scrape(options = {}) {
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        console.log(
          `🚀 Starting scrape attempt ${retryCount + 1}/${maxRetries}`
        );

        await this.initialize();

        // Test connectivity before proceeding
        const isAccessible = await this.testConnectivity();
        if (!isAccessible) {
          console.log("⚠️ Website may not be accessible, but continuing...");
        }

        let tournaments = [];
        let pageInfo = null;
        let paginationInfo = null;
        let allPages = [];

        if (options.searchParams) {
          // Check if we should scrape all pages
          if (options.scrapeAllPages) {
            const maxPages = options.maxPages || 10;
            const multiPageResult = await this.scrapeAllPages(
              options.searchParams,
              maxPages
            );
            tournaments = multiPageResult.tournaments;
            allPages = multiPageResult.pages;
            paginationInfo = {
              totalPages: multiPageResult.totalPages,
              totalTournaments: multiPageResult.totalTournaments,
            };
          } else {
            // Single page search
            let url = this.buildSearchUrl(options.searchParams);

            // Add page parameter if specified
            if (options.page && options.page > 1) {
              const urlObj = new URL(url);
              urlObj.searchParams.append("page", options.page.toString());
              url = urlObj.toString();
            }

            const html = await this.fetchPage(url);
            tournaments = await this.extractTournaments(html);
            paginationInfo = await this.getPaginationInfo(html);

            // Update pagination info with current page
            if (options.page) {
              paginationInfo.currentPage = options.page;
            }
          }
        } else {
          // Default scrape without search params
          let url = this.baseUrl;

          // Add page parameter if specified
          if (options.page && options.page > 1) {
            const urlObj = new URL(url);
            urlObj.searchParams.append("page", options.page.toString());
            url = urlObj.toString();
          }

          const html = await this.fetchPage(url);
          tournaments = await this.extractTournaments(html);
          pageInfo = await this.getPageInfo(html);
          paginationInfo = await this.getPaginationInfo(html);

          // Update pagination info with current page
          if (options.page) {
            paginationInfo.currentPage = options.page;
          }
        }

        if (options.saveResults !== false) {
          await this.saveResults(tournaments, options.filename);
        }

        return {
          success: true,
          tournaments,
          pageInfo,
          paginationInfo,
          allPages,
          totalCount: tournaments.length,
        };
      } catch (error) {
        console.error(
          `❌ Scraping attempt ${retryCount + 1} failed:`,
          error.message
        );

        if (retryCount === maxRetries - 1) {
          return {
            success: false,
            error: error.message,
            tournaments: [],
            pageInfo: null,
            paginationInfo: null,
            allPages: [],
          };
        }

        retryCount++;
        console.log(`⏳ Waiting 3 seconds before retry...`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } finally {
        await this.close();
      }
    }

    return {
      success: false,
      error: "Max retries exceeded",
      tournaments: [],
      pageInfo: null,
      paginationInfo: null,
      allPages: [],
    };
  }

  buildSearchUrl(searchParams = {}) {
    const url = new URL(this.baseUrl);

    if (searchParams.name) {
      url.searchParams.append("name", searchParams.name);
    }
    if (searchParams.location) {
      url.searchParams.append("location", searchParams.location);
    }
    if (searchParams.radius) {
      url.searchParams.append("radius", searchParams.radius);
    }
    if (searchParams.date) {
      url.searchParams.append("date", searchParams.date);
    } else if (searchParams.startDate) {
      url.searchParams.append("startDate", searchParams.startDate);
    }
    if (searchParams.structure) {
      url.searchParams.append("structure", searchParams.structure);
    }

    return url.toString();
  }
}

// CLI usage
if (require.main === module) {
  const scraper = new DartsAtlasScraper();

  const options = {
    searchParams: {
      // name: 'Open',
      // location: 'London',
      // radius: '50mi',
      // startDate: '2025-01-01',
      // structure: 'Knockout'
    },
    saveResults: true,
    filename: null,
  };

  scraper
    .scrape(options)
    .then((results) => {
      if (results.success) {
        console.log(`\n🎯 Scraping completed successfully!`);
        console.log(`📊 Found ${results.totalCount} tournaments`);
        if (results.pageInfo) {
          console.log(`📄 Page title: ${results.pageInfo.title}`);
        }
      } else {
        console.log(`\n❌ Scraping failed: ${results.error}`);
      }
    })
    .catch((error) => {
      console.error("❌ Unexpected error:", error);
    });
}

module.exports = DartsAtlasScraper;
