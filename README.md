# 🎯 Darts Atlas Tournament Scraper

A powerful web scraper for extracting tournament data from [Darts Atlas](https://www.dartsatlas.com/search?scope=tournaments). Built with Next.js, Cheerio, and modern web technologies.

## ✨ Features

- **Automatic Data Loading**: Loads initial tournament data automatically on page load (page 1 only)
- **LocalStorage Caching**: Caches data locally with automatic refresh every hour
- **Date-Based Search**: Search tournaments by specific dates using the `date` parameter
- **Advanced Search**: Filter tournaments by name, location, radius, date, and structure
- **Single-Page Scraping**: Efficiently scrapes only the current page by default
- **Multi-Page Scraping**: Optional multi-page scraping for comprehensive results
- **Pagination Support**: Navigate through multiple pages of tournament results
- **Fast Scraping**: Lightweight data extraction using Cheerio and Axios
- **User-friendly Interface**: Modern, responsive web interface
- **API Endpoints**: RESTful API for programmatic access
- **Data Export**: Automatic JSON export with timestamps
- **Error Handling**: Robust error handling and retry mechanisms

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd darts-atlas-tournaments
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to access the scraper interface.

## 📖 Usage

### Web Interface

1. **Automatic Data Loading**: The app automatically loads tournament data from page 1 on first visit
2. **Date Search**: Use the date picker at the top to search for tournaments on specific dates
3. **Advanced Search**: Click "Advanced Search" to access additional filters:
   - Tournament Name: Search for specific tournaments
   - Location: Filter by location (e.g., "London, UK")
   - Radius: Distance filter (25mi, 50mi, 100mi)
   - Structure: Tournament format (Knockout, Round-Robin)
4. **Cached Data**: Data is automatically cached in localStorage and refreshed every hour
5. **Single-Page Results**: By default, only scrapes the current page for faster performance
6. **Manual Refresh**: Use the "Refresh" button to reload data when needed
7. **Pagination Navigation**: Navigate through multiple pages using the pagination controls at the bottom of the results

### Command Line

Run the scraper directly from the command line:

```bash
npm run scrape
```

Or with custom parameters:

```bash
node scripts/scraper.js
```

### API Usage

#### POST /api/scrape

Start scraping with optional search parameters:

```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "searchParams": {
      "name": "Open",
      "location": "London",
      "radius": "50mi",
      "date": "2025-08-08",
      "structure": "Knockout"
    },
    "scrapeAllPages": true,
    "maxPages": 5,
    "saveResults": true,
    "filename": "custom-filename.json"
  }'
```

#### GET /api/scrape

Get API information and usage examples:

```bash
curl http://localhost:3000/api/scrape
```

## 🔧 Configuration

### Scraper Settings

Modify scraper settings in `scripts/scraper.js`:

```javascript
this.session = axios.create({
  timeout: 30000,
  headers: {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Upgrade-Insecure-Requests": "1",
  },
});
```

### LocalStorage Caching

The app automatically caches data in localStorage with the following behavior:
- **Cache Duration**: 1 hour
- **Automatic Refresh**: Data is refreshed when cache expires
- **Manual Refresh**: Users can manually refresh data using the "Refresh" button

## 📊 Data Structure

The scraper extracts the following tournament information:

```json
{
  "metadata": {
    "scrapedAt": "2025-01-15T10:30:00.000Z",
    "source": "https://www.dartsatlas.com/search?scope=tournaments",
    "totalTournaments": 25
  },
  "tournaments": [
    {
      "id": 1,
      "name": "London Open Championship",
      "location": "London, UK",
      "date": "2025-02-15",
      "structure": "Knockout",
      "status": "Registration Open",
      "description": "Annual open championship tournament...",
      "link": "https://www.dartsatlas.com/tournament/123",
      "image": "https://example.com/image.jpg",
      "rawHtml": "<div>...</div>"
    }
  ],
  "paginationInfo": {
    "currentPage": 1,
    "totalPages": 7,
    "hasNextPage": true,
    "hasPrevPage": false,
    "totalResults": 150
  }
}
```

## 🗂️ File Structure

```
darts-atlas-tournaments/
├── app/
│   ├── api/
│   │   └── scrape/
│   │       └── route.js          # API endpoints
│   ├── globals.css
│   ├── layout.js
│   └── page.js                   # Main interface
├── scripts/
│   ├── scraper.js                # Core scraper logic
│   ├── test-scraper.js           # Test script
│   └── test-date-search.js       # Date search test
├── data/                         # Scraped data (auto-generated)
├── public/
├── package.json
└── README.md
```

## 🛠️ Development

### Adding New Features

1. **Modify scraper logic** in `scripts/scraper.js`
2. **Update API endpoints** in `app/api/scrape/route.js`
3. **Enhance UI** in `app/page.js`

### Testing

```bash
# Run the scraper in test mode
npm run scrape

# Test date search functionality
node scripts/test-date-search.js

# Check for linting issues
npm run lint
```

## 🔒 Legal and Ethical Considerations

- **Respect robots.txt**: The scraper respects website robots.txt files
- **Rate limiting**: Built-in delays to avoid overwhelming the server
- **Terms of service**: Ensure compliance with Darts Atlas terms of service
- **Data usage**: Use scraped data responsibly and in accordance with applicable laws

## 🐛 Troubleshooting

### Common Issues

1. **No tournaments found**
   - Check if the website structure has changed
   - Verify search parameters are correct
   - Ensure the website is accessible

2. **Scraping fails**
   - Check internet connection
   - Verify website is not blocking automated access
   - Review browser console for errors

3. **Slow performance**
   - Increase timeout values in scraper configuration
   - Check if pagination is working correctly
   - Verify cache is being used effectively

4. **Date search not working**
   - Ensure date format is YYYY-MM-DD
   - Check if the date parameter is being passed correctly
   - Verify the website supports date-based search

## 🆕 Recent Updates

### Version 2.0.0
- ✅ **Automatic Data Loading**: Loads initial data on page load
- ✅ **LocalStorage Caching**: Caches data with 1-hour expiration
- ✅ **Date-Based Search**: Search tournaments by specific dates
- ✅ **Multi-Page Scraping**: Automatically handles pagination
- ✅ **Enhanced UI**: Improved search interface with date picker
- ✅ **Better Error Handling**: More robust error handling and user feedback
