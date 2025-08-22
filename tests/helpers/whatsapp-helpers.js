// helpers/whatsapp-helpers.js

// Configuration
const CONFIG = {
  contactName: "Whatsapp Automation",
  contactNumber: "+60 11-2635 2582",
  timeouts: {
    messageDelay: 8000,
    loginTimeout: 120000
  }
};

// Login and contact search function
async function loginAndOpenContact(page, test) {
  // Step 1: Navigate to WhatsApp Web and Login
  await test.step('✅ Login: Navigate to WhatsApp Web and complete login', async () => {
    console.log("📱 Opening WhatsApp Web...");
    await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    // Handle QR code scanning
    try {
      const qrCode = await page.waitForSelector('canvas[aria-label="Scan me!"]', { timeout: 5000 });
      if (qrCode) {
        console.log("📱 QR Code found! Please scan it to continue...");
        await page.screenshot({ path: 'screenshots/qr-code.png', fullPage: true });
      }
    } catch {
      console.log("ℹ️ No QR code found - checking login status.");
    }

    // Wait for login completion - using the same selector as your working code
    await page.waitForSelector('div[contenteditable="true"][data-tab="3"]', { timeout: 120000 });
    console.log("✅ Logged in successfully!");
    await page.screenshot({ path: 'screenshots/login-success.png', fullPage: true });
  });

  // Step 2: Search and open contact
  await test.step('✅ Contact Search: Find and open contact', async () => {
    console.log(`🔍 Searching for contact: ${CONFIG.contactName}`);

    // Find search box
    const searchSelectors = [
      '[data-testid="chat-list-search"]',
      'div[contenteditable="true"][data-tab="3"]',
      'div[contenteditable="true"]'
    ];

    let searchBox = null;
    for (const selector of searchSelectors) {
      try {
        searchBox = await page.waitForSelector(selector, { timeout: 10000 });
        if (searchBox) break;
      } catch (e) {
        continue;
      }
    }

    if (!searchBox) {
      throw new Error('Could not find search box');
    }

    // First try: Search by contact name
    await searchBox.click();
    await searchBox.fill(''); // Clear existing text
    await searchBox.type(CONFIG.contactName, { delay: 100 });
    await page.waitForSelector('[data-testid="cell-frame-container"], div[role="listitem"]', { timeout: 1000 }).catch(() => { });

    // Look for contact result by name
    const contactSelectors = [
      `span[title="${CONFIG.contactName}"]`,
      `span[title*="${CONFIG.contactName}"]`,
      '[data-testid="cell-frame-container"]',
      'div[role="listitem"]'
    ];


    let contactResult = null;
    for (const selector of contactSelectors) {
      try {
        contactResult = await page.waitForSelector(selector, { timeout: 5000 });
        if (contactResult) break;
      } catch (e) {
        continue;
      }
    }

    // If not found by name, try phone number
    if (!contactResult && CONFIG.contactNumber) {
      console.log(`📞 Trying phone number: ${CONFIG.contactNumber}`);

      // Clear search and try phone number
      await searchBox.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Delete');
      await searchBox.type(CONFIG.contactNumber, { delay: 100 });
      await page.waitForSelector('[data-testid="cell-frame-container"], div[role="listitem"]', { timeout: 1000 }).catch(() => { });

      // Look for contact result by phone number
      const contactSelectors = [
        `span[title*="${CONFIG.contactNumber}"]`,
        `span[title="${CONFIG.contactNumber}"]`,
        '[data-testid="cell-frame-container"]',
        'div[role="listitem"]'
      ];

      for (const selector of contactSelectors) {
        try {
          contactResult = await page.waitForSelector(selector, { timeout: 5000 });
          if (contactResult) break;
        } catch (e) {
          continue;
        }
      }
    }

    if (contactResult) {
      await contactResult.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screenshots/contact-opened.png', fullPage: true });
      console.log(`✅ Contact opened successfully`);
    } else {
      console.log("⚠️ Could not find contact");
      await page.screenshot({ path: 'screenshots/contact-not-found.png', fullPage: true });
    }
  });
}

// Send message function (original)
async function sendMessage(page, message, messageType = "message") {
  console.log(`💬 Sending ${messageType}: ${message}`);

  const messageBox = page.locator('div[contenteditable="true"][data-tab="10"]');
  await messageBox.waitFor({ state: 'visible', timeout: 10000 });
  await messageBox.click();
  await messageBox.fill(''); // Clear existing text
  await messageBox.type(message, { delay: 100 });
  await messageBox.press('Enter');

  console.log(`✅ ${messageType} sent successfully!`);
  await page.screenshot({ path: `screenshots/${messageType.toLowerCase().replace(' ', '-')}-sent.png`, fullPage: true });
}

// Send message to box function (for name validation)
async function sendMessageToBox(page, message) {
  const nameMessageBox = page.locator('div[contenteditable="true"][data-tab="10"]');
  await nameMessageBox.waitFor({ state: 'visible', timeout: 15000 });
  await nameMessageBox.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await nameMessageBox.type(message, { delay: 150 });
  await nameMessageBox.press('Enter');
}

// Receipt upload function
async function uploadReceipt(page, receiptPath) {
  console.log("📸 Uploading receipt image...");

  try {
    // Click the Attach button
    await page.getByRole('button', { name: /attach/i }).click();
    await page.waitForTimeout(1000);

    // Find the file input
    const fileInput = await page.$('input[type="file"][accept*="image"]');
    if (!fileInput) {
      throw new Error("File input not found!");
    }

    // Upload the file
    const path = require('path');
    const absolutePath = path.resolve(__dirname, '..', receiptPath);
    await fileInput.setInputFiles(absolutePath);

    // Wait for image preview dialog to appear
    await page.waitForSelector('xpath=//*[@id="app"]/div[1]/div[3]/div/div[2]/div[2]/span/div/div/div/div[2]/div/div[1]/div[2]/div/div/div/canvas[2]', { timeout: 30000 });

    // Wait for the send button to be enabled
    const sendButton = page.locator('div[role="button"][aria-label="Send"]:not([aria-disabled="true"])');
    await sendButton.waitFor({ state: 'visible', timeout: 60000 });


    // Click Send button
    try {
      await sendButton.click({ force: true });
      console.log("📸 Receipt image sent automatically success!");
    } catch (autoClickErr) {
      // ===== TEMPORARY MANUAL STEP =====
      console.log("⚠️ Automatic send button click failed. Please click the Send button manually in the browser.");
      // Wait up to 30 seconds for you to click manually
      await page.waitForTimeout(30000);
      // ===== REMOVE THIS BLOCK WHEN AUTO CLICK WORKS =====
    }

    return true;
  } catch (error) {
    console.error("❌ Receipt upload failed:", error.message);
    throw error;
  }
}

// Chat with agent function
async function chatWithAgent(page, agentMessage) {
  console.log("🤖 Looking for Chat with Agent button...");

  try {
    // Wait for the Chat with Agent button
    await page.waitForSelector('div._ahef[role="button"]:has-text("Chat with Agent")', { timeout: 20000 });

    // Click the button
    await page.click('div._ahef[role="button"]:has-text("Chat with Agent")');
    console.log("✅ Chat with Agent button clicked!");

    await page.waitForTimeout(8000);

    // Send message to agent
    await sendMessage(page, agentMessage, "Agent enquiry");

    console.log("✅ Agent enquiry sent successfully!");
    return true;

  } catch (error) {
    console.error("❌ Error with Chat with Agent:", error.message);
    await page.screenshot({ path: 'screenshots/chat-agent-error.png', fullPage: true });
    throw error;
  }
}

// Export functions and config
module.exports = {
  loginAndOpenContact,
  sendMessage,
  sendMessageToBox,
  uploadReceipt,
  chatWithAgent,
  CONFIG
};



/*
await searchBox.fill('');
      await searchBox.type(CONFIG.contactNumber, { delay: 100 });


      await searchBox.click();
    await searchBox.fill(''); // Clear existing text
    await searchBox.type(CONFIG.contactName, { delay: 100 });
    await page.waitForSelector('[data-testid="cell-frame-container"], div[role="listitem"]', { timeout: 1000 }).catch(() => { });

*/

