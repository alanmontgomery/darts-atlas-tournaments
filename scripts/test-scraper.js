const DartsAtlasScraper = require('./scraper.js');

async function testScraper() {
  console.log('🧪 Testing Darts Atlas Scraper (Cheerio version)...\n');
  
  const scraper = new DartsAtlasScraper();
  
  try {
    // Test 1: Basic initialization
    console.log('1️⃣ Testing initialization...');
    await scraper.initialize();
    console.log('✅ Initialization successful\n');
    
    // Test 2: Connectivity test
    console.log('2️⃣ Testing connectivity...');
    const isAccessible = await scraper.testConnectivity();
    if (isAccessible) {
      console.log('✅ Connectivity test successful\n');
    } else {
      console.log('⚠️ Connectivity test had issues\n');
    }
    
    // Test 3: Page fetching
    console.log('3️⃣ Testing page fetching...');
    const html = await scraper.fetchPage();
    if (html && html.length > 0) {
      console.log('✅ Page fetching successful\n');
    } else {
      console.log('❌ Page fetching failed\n');
      return;
    }
    
    // Test 4: Basic extraction
    console.log('4️⃣ Testing basic extraction...');
    const tournaments = await scraper.extractTournaments(html);
    console.log(`✅ Extracted ${tournaments.length} tournaments\n`);
    
    // Test 5: Page info
    console.log('5️⃣ Testing page info extraction...');
    const pageInfo = await scraper.getPageInfo(html);
    console.log('✅ Page info extracted:', {
      title: pageInfo.title,
      url: pageInfo.url,
      totalResults: pageInfo.totalResults
    });
    
    // Test 6: Search functionality
    console.log('6️⃣ Testing search functionality...');
    const searchResults = await scraper.searchTournaments({});
    console.log(`✅ Search returned ${searchResults.length} results\n`);
    
    console.log('\n🎯 All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await scraper.close();
  }
}

// Run the test
if (require.main === module) {
  testScraper().catch(console.error);
}

module.exports = testScraper;
