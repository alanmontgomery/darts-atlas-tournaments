# 🔧 Troubleshooting Guide

## Socket Hang Up Errors

### What is a "Socket Hang Up" Error?

A "socket hang up" error occurs when the connection to the target website is unexpectedly terminated. This can happen due to:

- Network connectivity issues
- Website anti-bot measures
- Server overload
- Firewall or proxy restrictions
- DNS resolution problems

### Solutions

#### 1. **Check Internet Connection**
```bash
# Test basic connectivity
ping www.dartsatlas.com

# Test DNS resolution
nslookup www.dartsatlas.com
```

#### 2. **Run the Test Script**
```bash
npm run test-scraper
```

This will help identify where the issue occurs:
- Initialization
- Navigation
- Content detection
- Data extraction

#### 3. **Adjust Timeout Settings**

If you're experiencing timeouts, modify the timeout values in `scripts/scraper.js`:

```javascript
// Increase timeout values
this.page.setDefaultTimeout(120000); // 2 minutes
this.page.setDefaultNavigationTimeout(120000); // 2 minutes
```

#### 4. **Use Headless Mode**

For production or if you're having display issues:

```javascript
// In scripts/scraper.js, change:
headless: true, // Instead of false
```

#### 5. **Check for Website Changes**

The website structure might have changed. Run the scraper with debug mode:

```javascript
// Add this to scripts/scraper.js for debugging
console.log('Debug: Page content:', await this.page.content());
```

#### 6. **Network Configuration**

If you're behind a corporate firewall or proxy:

```javascript
// Add proxy configuration if needed
args: [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--proxy-server=your-proxy:port" // Add your proxy if needed
]
```

### Common Error Messages and Solutions

#### "ECONNRESET"
- **Cause**: Connection reset by server
- **Solution**: Wait and retry, or check if the website is blocking automated access

#### "ENOTFOUND"
- **Cause**: DNS resolution failed
- **Solution**: Check internet connection and DNS settings

#### "Timeout"
- **Cause**: Request took too long
- **Solution**: Increase timeout values or check network speed

#### "Navigation timeout"
- **Cause**: Page took too long to load
- **Solution**: Increase navigation timeout or check website availability

### Advanced Debugging

#### 1. **Enable Verbose Logging**

Add this to your scraper call:

```javascript
const scraper = new DartsAtlasScraper();
scraper.debug = true; // Enable debug mode
```

#### 2. **Check Browser Console**

Run the scraper with `headless: false` to see the browser and check for errors in the console.

#### 3. **Monitor Network Requests**

Add this to see network activity:

```javascript
// In scripts/scraper.js
this.page.on('request', request => {
  console.log('Request:', request.url());
});

this.page.on('response', response => {
  console.log('Response:', response.url(), response.status());
});
```

### Environment-Specific Issues

#### macOS
- Ensure you have the latest version of Chrome/Chromium
- Check if any security software is blocking the connection

#### Windows
- Run as administrator if needed
- Check Windows Defender or antivirus settings

#### Linux
- Install required dependencies: `sudo apt-get install -y gconf-service libasound2...`
- Check if running in a container (Docker) - may need additional configuration

### Performance Optimization

#### 1. **Reduce Resource Usage**
```javascript
args: [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-accelerated-2d-canvas",
  "--no-first-run",
  "--no-zygote",
  "--disable-gpu",
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-renderer-backgrounding"
]
```

#### 2. **Optimize Memory Usage**
```javascript
// Limit memory usage
args: [
  "--memory-pressure-off",
  "--max_old_space_size=4096"
]
```

### Getting Help

If you're still experiencing issues:

1. **Check the logs** for specific error messages
2. **Run the test script** to identify the failing step
3. **Try with different settings** (headless mode, different timeouts)
4. **Check if the website is accessible** in a regular browser
5. **Verify your network connection** and any firewall settings

### Example Debug Session

```bash
# 1. Test basic connectivity
ping www.dartsatlas.com

# 2. Run the test script
npm run test-scraper

# 3. If test fails, run with debug
node scripts/scraper.js

# 4. Check the generated logs and data files
ls -la data/
```

Remember: The scraper includes automatic retry logic and error handling, so many temporary issues will be resolved automatically.
