const { test, expect, chromium } = require('@playwright/test');

test.describe('WhatsApp Web Tests', () => {
  let browser, context, page;

  test.beforeAll(async () => {
    test.setTimeout(300000); // 5 minutes
    
    // Launch browser with video recording and anti-detection settings
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    context = await browser.newContext({
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
    
    page = await context.newPage();
    
    // Set longer timeouts
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);

    console.log("📱 Opening WhatsApp Web for initial setup...");
    await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Handle QR code scanning once for all tests
    await page.waitForTimeout(5000);
    
    try { 
      // Check if QR code exists
      const qrCode = await page.waitForSelector('canvas[aria-label="Scan me!"]', { timeout: 3000 });
      if (qrCode) {
        console.log("📱 QR Code found! Please scan it to continue with all tests.");
        await page.screenshot({ path: 'screenshots/qr-code-setup.png', fullPage: true });
        
        // Wait for login completion
        const chatElements = await Promise.race([
          page.waitForSelector('[data-testid="chat-list"]', { timeout: 120000 }).catch(() => null),
          page.waitForSelector('[data-testid="chat-list-search"]', { timeout: 120000 }).catch(() => null),
          page.waitForSelector('div[contenteditable="true"]', { timeout: 120000 }).catch(() => null)
        ]);
        
        if (chatElements) {
          console.log("✅ Successfully logged in to WhatsApp Web!");
        }
      }
    } catch {
      console.log("ℹ️ No QR code found - checking login status.");
    }

    console.log("✅ WhatsApp Web setup completed! Ready for tests.");
  });

  test.afterAll(async () => {
    if (browser) {
      console.log("🔄 Closing browser...");
      await browser.close();
    }
  });

  test('Navigate to WhatsApp Web and complete login', async () => {
    test.setTimeout(180000); // 3 minutes

    try {
      // Step 1: Verify WhatsApp Web navigation
      await test.step('Navigate to WhatsApp Web', async () => {
        console.log("📱 Verifying WhatsApp Web navigation...");
        
        // Verify we're on WhatsApp Web
        await expect(page).toHaveTitle(/WhatsApp/);
        await page.screenshot({ path: 'screenshots/whatsapp-loaded.png', fullPage: true });
        console.log("✅ WhatsApp Web navigation verified!");
      });
      
      // Step 2: Check login status and completion
      await test.step('Check login status and wait for completion', async () => {
        console.log("🔍 Checking login status...");
        
        // Wait for page to stabilize
        await page.waitForTimeout(2000);
        
        // Check for loading state
        try {
          const loadingText = await page.locator('text=Loading your chats').waitFor({ timeout: 3000 });
          if (loadingText) {
            console.log("⏳ Chats are loading...");
            await page.screenshot({ path: 'screenshots/loading-chats.png', fullPage: true });
            await page.waitForSelector('text=Loading your chats', { state: 'hidden', timeout: 30000 });
          }
        } catch {
          console.log("ℹ️ No loading state found.");
        }
        
        // Check if logged in by looking for chat elements
        const chatElements = await Promise.race([
          page.waitForSelector('[data-testid="chat-list"]', { timeout: 30000 }).catch(() => null),
          page.waitForSelector('[data-testid="chat-list-search"]', { timeout: 30000 }).catch(() => null),
          page.waitForSelector('div[contenteditable="true"]', { timeout: 30000 }).catch(() => null)
        ]);
        
        if (chatElements) {
          console.log("✅ Successfully logged in to WhatsApp Web!");
          await page.screenshot({ path: 'screenshots/login-success.png', fullPage: true });
        } else {
          throw new Error("Login elements not found");
        }
      });

      console.log("🎉 WhatsApp login completed successfully!");

    } catch (error) {
      console.error(`❌ Error in login workflow: ${error.message}`);
      
      // Take screenshot for debugging
      await page.screenshot({ 
        path: `test-results/whatsapp-login-error-${Date.now()}.png`, 
        fullPage: true 
      });
      
      throw error;
    }
  });

  test('Verify WhatsApp Web loads correctly', async () => {
    test.setTimeout(120000); // 2 minutes

    try {
      // Small wait to prevent buzzing between tests
      await page.waitForTimeout(2000);
      
      await test.step('Verify page loads correctly', async () => {
        console.log("🔄 Verifying WhatsApp Web loads correctly...");
        
        // Verify page loads
        await expect(page).toHaveTitle(/WhatsApp/);
        await page.screenshot({ path: 'screenshots/page-load-verification.png', fullPage: true });
        console.log("✅ Page load verification passed!");
      });

      await test.step('Verify main interface elements', async () => {
        console.log("👀 Checking main interface elements...");
        
        // Verify QR code or main interface appears
        const qrCode = page.locator('[data-testid="qr-code"]');
        const chatList = page.locator('[data-testid="chat-list"]');
        const searchBox = page.locator('div[contenteditable="true"]');
        
        // Either QR code should be visible (not logged in) or chat interface (logged in)
        await expect(qrCode.or(chatList).or(searchBox)).toBeVisible({ timeout: 30000 });
        await page.screenshot({ path: 'screenshots/interface-verification.png', fullPage: true });
        console.log("✅ Main interface elements verified!");
      });

      console.log("🎉 WhatsApp Web loads correctly!");

    } catch (error) {
      console.error(`❌ Error in load verification: ${error.message}`);
      
      // Take screenshot for debugging
      await page.screenshot({ 
        path: `test-results/whatsapp-load-error-${Date.now()}.png`, 
        fullPage: true 
      });
      
      throw error;
    }

    // Keep browser open for inspection in non-CI environments
    if (!process.env.CI) {
      console.log("> Browser will remain open for inspection...");
      await page.waitForTimeout(5000);
    }
  });
});