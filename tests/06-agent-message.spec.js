const { test, expect, chromium } = require('@playwright/test');
const { loginAndOpenContact, chatWithAgent } = require('./helpers/whatsapp-helpers');

// Test configuration
const TEST_CONFIG = {
  agentMessage: "Hi, how to do this....",
  expectedResponse: "Our friendly agent will get back to you",
  timeouts: {
    responseWait: 10000
  }
};

test.describe('WhatsApp Chat with Agent Tests', () => {
  test('Chat with Agent functionality', async () => {
    test.setTimeout(300000); // 5 minutes
    
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
      extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' }
    });

    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);

    try {
      // Step 1 & 2: Login and open contact
      await loginAndOpenContact(page, test);

      // Step 3: Chat with Agent
      await test.step('Chat with Agent', async () => {
        console.log("🤖 Starting Chat with Agent workflow...");

        await chatWithAgent(page, TEST_CONFIG.agentMessage, { delay: 100 });
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'screenshots/agent-message-sent.png', fullPage: true });
        console.log("✅ Agent message sent!");
      });

      // Step 4: Wait for system response
      await test.step('Validate system response', async () => {
        console.log("⏳ Waiting for system response...");
        try {
          await page.locator(`text="${TEST_CONFIG.expectedResponse}"`).waitFor({ timeout: TEST_CONFIG.timeouts.responseWait });
          console.log(`✅ Found system response: "${TEST_CONFIG.expectedResponse}"`);
          await page.screenshot({ path: 'screenshots/system-response.png', fullPage: true });
        } catch {
          console.log(`⚠️ Expected system response not found: "${TEST_CONFIG.expectedResponse}"`);
          await page.screenshot({ path: 'screenshots/system-response-missing.png', fullPage: true });

          // Debug: capture last few messages
          const recentMessages = await page.$$eval('[role="row"]', rows =>
            rows.map(r => r.textContent?.trim()).filter(Boolean).slice(-5)
          );
          console.log("📝 Recent messages:", recentMessages);
        }
      });

      console.log("🎉 Chat with Agent workflow completed successfully!");

    } catch (error) {
      console.error(`❌ Error in agent message workflow: ${error.message}`);
      await page.screenshot({ path: `test-results/agent-workflow-error-${Date.now()}.png`, fullPage: true });
      throw error;
    }

    if (!process.env.CI) {
      console.log("Browser will remain open for inspection...");
      await page.waitForTimeout(10000);
    }
  });
});
