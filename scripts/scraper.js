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

  async fetchEntriesCount(tournamentLink) {
    if (!tournamentLink) return null;

    try {
      const entriesUrl = `https://www.dartsatlas.com${tournamentLink}/entries`;
      console.log(`🔍 Fetching entries count from: ${entriesUrl}`);

      const response = await this.session.get(entriesUrl, {
        timeout: 10000,
      });

      if (response.status !== 200) {
        console.log(`⚠️ Failed to fetch entries page: ${response.status}`);
        return null;
      }

      const $ = cheerio.load(response.data);

      // Look for the order-of-merit table specifically
      const orderOfMeritTable = $("table.order-of-merit");

      if (orderOfMeritTable.length > 0) {
        // Count the rows in the tbody
        const tbody = orderOfMeritTable.find("tbody");
        if (tbody.length > 0) {
          const rows = tbody.find("tr");
          const entriesCount = rows.length;

          if (entriesCount > 0) {
            console.log(
              `✅ Found ${entriesCount} entries in order-of-merit table`
            );
            return entriesCount;
          }
        }
      }

      // Fallback: Try to find any table with entries/participants
      const tables = $("table");
      for (let i = 0; i < tables.length; i++) {
        const table = $(tables[i]);
        const tbody = table.find("tbody");
        if (tbody.length > 0) {
          const rows = tbody.find("tr");
          // Check if this looks like an entries table (has user links or player names)
          const hasUserLinks = rows.find('a[href*="/players/"]').length > 0;
          const hasPlayerNames = rows
            .find("td")
            .text()
            .match(/[a-zA-Z]/);

          if (hasUserLinks || hasPlayerNames) {
            const entriesCount = rows.length;
            if (entriesCount > 0) {
              console.log(
                `✅ Found ${entriesCount} entries in table (fallback)`
              );
              return entriesCount;
            }
          }
        }
      }

      // If still no count found, try the old methods as fallback
      const selectors = [
        ".entries-count",
        ".participants-count",
        '[class*="entries"]',
        '[class*="participants"]',
        ".count",
        "h1, h2, h3", // Look for headings that might contain count
      ];

      let entriesCount = null;

      for (const selector of selectors) {
        const element = $(selector);
        if (element.length > 0) {
          const text = element.text().trim();
          // Look for numbers in the text
          const match = text.match(/(\d+)/);
          if (match) {
            entriesCount = parseInt(match[1], 10);
            console.log(
              `✅ Found entries count: ${entriesCount} using selector: ${selector}`
            );
            break;
          }
        }
      }

      // If no specific count found, try to count entries in a list
      if (!entriesCount) {
        const entriesList = $(
          '.entries-list, .participants-list, [class*="entries"], [class*="participants"]'
        );
        if (entriesList.length > 0) {
          const entries = entriesList.find("li, .entry, .participant");
          if (entries.length > 0) {
            entriesCount = entries.length;
            console.log(`✅ Counted ${entriesCount} entries from list`);
          }
        }
      }

      // If still no count, try to find any text that mentions numbers of players
      if (!entriesCount) {
        const bodyText = $("body").text();
        const playerMatch = bodyText.match(
          /(\d+)\s*(?:player|participant|entry|entrant)/i
        );
        if (playerMatch) {
          entriesCount = parseInt(playerMatch[1], 10);
          console.log(`✅ Found entries count from text: ${entriesCount}`);
        }
      }

      return entriesCount;
    } catch (error) {
      console.log(`⚠️ Error fetching entries count: ${error.message}`);
      return null;
    }
  }

  async extractTournaments(html, fetchEntries = false) {
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
      "li",
      "article",
      "div",
    ];

    for (const selector of selectors) {
      elements = $(selector);
      if (elements.length > 0) {
        console.log(
          `✅ Found ${elements.length} elements using selector: ${selector}`
        );
        break;
      }
    }

    if (elements.length === 0) {
      console.log("⚠️ No tournament elements found");
      return [];
    }

    // Filter elements to only include those that look like tournaments
    elements = elements.filter((index, element) => {
      const $element = $(element);
      const textContent = $element.text().trim().toLowerCase();
      return (
        textContent.includes("tournament") ||
        textContent.includes("event") ||
        $element.find("a[href*='tournament']").length > 0 ||
        $element.find(".tournament").length > 0
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

  async enrichTournamentsWithEntries(tournaments) {
    console.log("🔍 Enriching tournaments with entries data...");

    const enrichedTournaments = [];

    for (let i = 0; i < tournaments.length; i++) {
      const tournament = { ...tournaments[i] };

      if (tournament.link) {
        try {
          const entriesCount = await this.fetchEntriesCount(tournament.link);
          if (entriesCount !== null) {
            tournament.entriesCount = entriesCount;
            console.log(
              `✅ Added entries count (${entriesCount}) to tournament: ${tournament.name}`
            );
          }
        } catch (error) {
          console.log(
            `⚠️ Failed to fetch entries for tournament ${tournament.name}: ${error.message}`
          );
        }
      }

      enrichedTournaments.push(tournament);

      // Add a small delay to avoid overwhelming the server
      if (i < tournaments.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log(
      `✅ Enriched ${enrichedTournaments.length} tournaments with entries data`
    );
    return enrichedTournaments;
  }

  async searchTournaments(searchParams = {}, includeEntries = false) {
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
      const tournaments = await this.extractTournaments(html);

      // Optionally enrich with entries data
      if (includeEntries && tournaments.length > 0) {
        console.log("🔍 Including entries data in search results...");
        return await this.enrichTournamentsWithEntries(tournaments);
      }

      return tournaments;
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

  async scrapePage(url, pageNumber = 1, includeEntries = false) {
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

      // Optionally enrich with entries data
      let enrichedTournaments = tournaments;
      if (includeEntries && tournaments.length > 0) {
        console.log(`🔍 Including entries data for page ${pageNumber}...`);
        enrichedTournaments = await this.enrichTournamentsWithEntries(
          tournaments
        );
      }

      return {
        tournaments: enrichedTournaments,
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

  async scrapeAllPages(
    searchParams = {},
    maxPages = 10,
    includeEntries = false
  ) {
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

        const pageResult = await this.scrapePage(
          baseUrl,
          currentPage,
          includeEntries
        );

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

        // Check if entries should be included
        const includeEntries = options.includeEntries || false;

        if (options.searchParams) {
          // Check if we should scrape all pages
          if (options.scrapeAllPages) {
            const maxPages = options.maxPages || 10;
            const multiPageResult = await this.scrapeAllPages(
              options.searchParams,
              maxPages,
              includeEntries
            );
            tournaments = multiPageResult.tournaments;
            allPages = multiPageResult.pages;
            paginationInfo = {
              totalPages: multiPageResult.totalPages,
              totalTournaments: multiPageResult.totalTournaments,
            };
          } else {
            // Single page search
            tournaments = await this.searchTournaments(
              options.searchParams,
              includeEntries
            );
            paginationInfo = await this.getPaginationInfo(
              await this.fetchPage(this.buildSearchUrl(options.searchParams))
            );

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

          // Optionally enrich with entries data
          if (includeEntries && tournaments.length > 0) {
            console.log("🔍 Including entries data in scrape results...");
            tournaments = await this.enrichTournamentsWithEntries(tournaments);
          }

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
