const DartsAtlasScraper = require('./scraper.js');

async function testPagination() {
  try {
    console.log('🧪 Testing pagination functionality...');
    
    const scraper = new DartsAtlasScraper();
    await scraper.initialize();
    
    // Test page 1
    console.log('\n1️⃣ Testing page 1...');
    const page1Results = await scraper.scrape({
      searchParams: {},
      scrapeAllPages: false,
      page: 1
    });
    
    if (page1Results.success) {
      console.log(`✅ Page 1: ${page1Results.totalCount} tournaments`);
      console.log('📄 Pagination info:', page1Results.paginationInfo);
    } else {
      console.log('❌ Page 1 failed:', page1Results.error);
    }
    
    // Test page 2
    console.log('\n2️⃣ Testing page 2...');
    const page2Results = await scraper.scrape({
      searchParams: {},
      scrapeAllPages: false,
      page: 2
    });
    
    if (page2Results.success) {
      console.log(`✅ Page 2: ${page2Results.totalCount} tournaments`);
      console.log('📄 Pagination info:', page2Results.paginationInfo);
    } else {
      console.log('❌ Page 2 failed:', page2Results.error);
    }
    
    await scraper.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPagination();
