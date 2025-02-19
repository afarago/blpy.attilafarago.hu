const puppeteer = require('puppeteer');
const fs = require('fs'); // For directory creation

async function generateScreenshots() {
  const browser = await puppeteer.launch(); // { headless: false } for debugging
  const page = await browser.newPage();

    // Create the screenshots directory if it doesn't exist
    const screenshotsDir = 'public/screenshots';
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

  const sizes = [
    { width: 1024, height: 768, filename: 'screenshot-1024x768.png' },
    { width: 1280, height: 720, filename: 'screenshot-1280x720.png' },
    { width: 1920, height: 1080, filename: 'screenshot-1920x1080.png' },
    { width: 375, height: 812, filename: 'screenshot-mobile-375x812.png' }, // Example mobile
  ];

  for (const { width, height, filename } of sizes) {
    await page.setViewport({ width, height });
    // Important: Use the correct URL for your *built* app, not localhost.
    // Use a relative path so it works when deployed to different environments
    const baseUrl = process.env.VITE_BASE_URL || "https://localhost:5173";
    console.log(`Navigating to ${baseUrl}`); // Helpful for debugging
    await page.goto(`${baseUrl}`); // or `${baseUrl}your/route` if needed

    await page.screenshot({ path: `${screenshotsDir}/${filename}`, type: 'png' });
    console.log(`Screenshot ${filename} generated.`); // Helpful for debugging
  }

  await browser.close();
}

generateScreenshots().catch(console.error); // Handle errors