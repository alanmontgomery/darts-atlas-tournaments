const DartsAtlasScraper = require('./scraper.js');

async function testExtraction() {
  try {
    console.log('🔍 Testing extraction functions...');
    
    const scraper = new DartsAtlasScraper();
    await scraper.initialize();
    
    const html = await scraper.fetchPage();
    const tournaments = await scraper.extractTournaments(html);
    
    console.log(`\n✅ Extracted ${tournaments.length} tournaments`);
    
    if (tournaments.length > 0) {
      console.log('\n🎯 First 3 tournaments data:');
      tournaments.slice(0, 3).forEach((tournament, index) => {
        console.log(`\n--- Tournament ${index + 1} ---`);
        console.log('  Name:', tournament.name);
        console.log('  Date:', tournament.date);
        console.log('  Day:', tournament.day);
        console.log('  Month:', tournament.month);
        console.log('  Full Date:', tournament.fullDate);
        console.log('  Time:', tournament.time);
        console.log('  Venue:', tournament.venue);
        console.log('  Venue URL:', tournament.venueUrl);
        console.log('  Venue Address:', tournament.venueAddress);
      });
    }
    
    await scraper.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testExtraction();
