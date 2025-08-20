const { test, expect, chromium } = require('@playwright/test');
const { loginAndOpenContact, sendMessage, CONFIG } = require('./helpers/whatsapp-helpers');

// Test-specific configuration
const TEST_CONFIG = {
  triggerMessage: "kuhentest"
};

test.describe('WhatsApp Trigger Message Tests', () => {
  test('Send trigger message and handle proceed button', async () => {
    test.setTimeout(300000); // 5 minutes
    
    // Launch browser with same config as your working search-contact code
    const browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      recordVideo: {
        dir: './test-results/videos',
        size: { width: 1280, height: 720 }
      },
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const page = await context.newPage();
    
    // Set longer timeouts
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);

    try {
      // Step 1 & 2: Login and open contact
      await loginAndOpenContact(page, test);

      // Step 3: Send trigger message
      await test.step('Send trigger message', async () => {
        await sendMessage(page, TEST_CONFIG.triggerMessage, "Trigger message");
        await page.waitForTimeout(8000);
        await page.screenshot({ path: 'screenshots/after-trigger-message.png', fullPage: true });
      });

      // Step 4: Click Proceed button
      await test.step('Click Proceed button', async () => {
        console.log("🔘 Looking for Proceed button...");
        
        try {
          const proceedButton = await page.waitForSelector('div._ahef[role="button"]:has-text("Proceed")', { 
            timeout: 15000 
          });
          
          await proceedButton.click();
          console.log("✅ Clicked Proceed button!");
          await page.screenshot({ path: 'screenshots/proceed-button-clicked.png', fullPage: true });
          
        } catch (error) {
          console.log("❌ Proceed button not found");
          await page.screenshot({ path: 'screenshots/proceed-button-debug.png', fullPage: true });
          throw new Error("Proceed button not found");
        }
      });

      console.log("🎉 Trigger message workflow completed!");

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      await page.screenshot({ 
        path: `test-results/error-${Date.now()}.png`, 
        fullPage: true 
      });
      throw error;
    }

    if (!process.env.CI) {
      await page.waitForTimeout(10000);
    }

    // Close browser
    await browser.close();
  });
});