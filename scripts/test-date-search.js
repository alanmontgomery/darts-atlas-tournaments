const DartsAtlasScraper = require('./scraper.js');

async function testDateSearch() {
  console.log('🧪 Testing date-based search functionality...\n');
  
  const scraper = new DartsAtlasScraper();
  
  try {
    await scraper.initialize();
    
    // Test 1: Search with a specific date
    console.log('1️⃣ Testing date search for 2025-08-08...');
    const dateSearchResults = await scraper.searchTournaments({
      date: '2025-08-08'
    });
    
    console.log(`✅ Date search returned ${dateSearchResults.length} tournaments\n`);
    
    // Test 2: Test pagination info extraction
    console.log('2️⃣ Testing pagination info extraction...');
    const html = await scraper.fetchPage('https://www.dartsatlas.com/search?date=2025-08-08&scope=tournaments');
    const paginationInfo = await scraper.getPaginationInfo(html);
    
    console.log('✅ Pagination info:', paginationInfo);
    
    // Test 3: Test multi-page scraping
    console.log('3️⃣ Testing multi-page scraping...');
    const multiPageResults = await scraper.scrapeAllPages({
      date: '2025-08-08'
    }, 3);
    
    console.log(`✅ Multi-page scraping returned ${multiPageResults.totalTournaments} tournaments from ${multiPageResults.totalPages} pages\n`);
    
    console.log('🎯 All date search tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await scraper.close();
  }
}

// Run the test
if (require.main === module) {
  testDateSearch().catch(console.error);
}

module.exports = testDateSearch;
