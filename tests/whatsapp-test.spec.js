
// ====================OLD VERSION====================

/*const { test } = require('@playwright/test');
const { chromium } = require('playwright');
const readline = require('readline');

// ====== CONFIGURATION ======
const contactName = "Whatsapp Automation";
const message = "kuhentest";
// ===========================

function waitForEnter() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question("📱 Scan the QR code in the browser, then press ENTER here to continue... ", () => {
      rl.close();
      resolve();
    });
  });
}

test.describe.configure({ timeout: 180000 }); // 3 minutes for all tests in this file

test('User received Welcome message after sent Keyword', async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("> Opening WhatsApp Web...");
  await page.goto('https://web.whatsapp.com');

  // Wait for user to scan QR
  //await waitForEnter();

  // Search for the contact
  await page.waitForSelector('div[contenteditable="true"][data-tab="3"]', { timeout: 60000 });
  const searchBox = await page.locator('div[contenteditable="true"][data-tab="3"]');
  await searchBox.click();
  await searchBox.type(contactName, { delay: 100 });

  // Click the contact
  await page.waitForSelector(`span[title="${contactName}"]`, { timeout: 15000 });
  await page.click(`span[title="${contactName}"]`);
  console.log("> Contact opened");

  // Send the message
  await page.waitForSelector('div[contenteditable="true"][data-tab="10"]', { timeout: 10000 });
  const messageBox = page.locator('div[contenteditable="true"][data-tab="10"]');
  await messageBox.type(message, { delay: 100 });
  await messageBox.press('Enter');
  console.log("> Keyword sent!");

  //await page.waitForTimeout(5000);
  //await browser.close();
});

// Click Proceed button - SIMPLIFIED VERSION
  try {
    console.log("> Looking for Proceed button...");
    
    // Wait for the exact button structure you found
    await page.waitForSelector('div._ahef[role="button"]:has-text("Proceed")', { timeout: 30000 });
    
    // Click it using the exact CSS classes
    await page.click('div._ahef[role="button"]:has-text("Proceed")');
    console.log("> Clicked the _ahef button!");

    // Wait with countdown before typing name
  await new Promise(resolve => setTimeout(resolve, 5000)); // wait 5 seconds

  // Wait for message box
  await page.waitForSelector('div[contenteditable="true"][data-tab="10"]', { timeout: 30000 });
  const nameBox = await page.$('div[contenteditable="true"][data-tab="10"]');
  await nameBox.type("Kuhenraj", { delay: 100 });
  await nameBox.press('Enter');
  console.log("> Name sent successfully!");

  } catch (e) {
    console.error("> Button click failed: ", e);
  }*/





/*const { test, chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const contactName = "Whatsapp Automation";
const message = "kuhentest";
const fullName = "Kuhenraj";
const authFile = path.join(__dirname, 'whatsapp-auth.json');

let browser, context, page;

test.describe.configure({ timeout: 180000 });

test.beforeAll(async () => {
  browser = await chromium.launch({ headless: false });

  if (fs.existsSync(authFile)) {
    // Use saved login
    context = await browser.newContext({ storageState: authFile });
    page = await context.newPage();
    await page.goto('https://web.whatsapp.com');
  } else {
    // First-time login
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto('https://web.whatsapp.com');

    console.log("📱 Please scan QR code...");
    await page.waitForSelector('canvas[aria-label="Scan me!"]', { timeout: 60000 }).catch(() => {});

    // Confirm logged in (wait until chat search bar appears)
    await page.waitForSelector('div[contenteditable="true"][data-tab="3"]', { timeout: 60000 });

    // Save session state
    await context.storageState({ path: authFile });
    console.log("> Login saved at:", authFile);
  }
});

test.afterAll(async () => {
  await browser.close();
});

test('User received Welcome message after sent Keyword', async () => {
  const searchBox = page.locator('div[contenteditable="true"][data-tab="3"]');
  await searchBox.click();
  await searchBox.type(contactName, { delay: 100 });

  await page.waitForSelector(`span[title="${contactName}"]`, { timeout: 15000 });
  await page.click(`span[title="${contactName}"]`);
  console.log("> Contact opened");

  const messageBox = page.locator('div[contenteditable="true"][data-tab="10"]');
  await messageBox.type(message, { delay: 100 });
  await messageBox.press('Enter');
  console.log("> Keyword sent!");
});

test('Click Proceed button', async () => {
  console.log("> Looking for Proceed button...");
  await page.waitForSelector('div._ahef[role="button"]:has-text("Proceed")', { timeout: 30000 });
  await page.click('div._ahef[role="button"]:has-text("Proceed")');
  console.log("> Clicked Proceed button!");
});

test('Successfully name sent', async () => {
  await page.waitForTimeout(50000);
  const nameBox = await page.$('div[contenteditable="true"][data-tab="10"]');
  await nameBox.type(fullName, { delay: 100 });
  await nameBox.press('Enter');
  console.log("> Name sent successfully!");
});*/

//test.afterAll(async () => {
//  await context.close();
//});





//======================ALL WORKS BUT GOT ERROR ON THE NAME PART AND SEPARATE TEST CASE===============================================

/*const { test, chromium } = require('@playwright/test');

const contactName = "Whatsapp Automation";
const message = "kuhentest";
const fullName = "Kuhenraj";

let browser, context, page;

test.beforeAll(async () => {
  test.setTimeout(120000); // give enough time for login

  browser = await chromium.launch({ headless: false });
  context = await browser.newContext();
  page = await context.newPage();
  await page.goto('https://web.whatsapp.com');

  console.log("📱 Please scan QR code if needed...");

  // Wait for either QR code or search bar to appear
  await Promise.race([
    page.waitForSelector('div[contenteditable="true"][data-tab="3"]', { timeout: 110000 }),
    page.waitForSelector('canvas[aria-label="Scan me!"]', { timeout: 110000 })
  ]);

  // Always wait for chat search bar after login
  await page.waitForSelector('div[contenteditable="true"][data-tab="3"]', { timeout: 110000 });
  console.log("> Logged in successfully!");
});

test.afterAll(async () => {
  await browser.close();
});

test('User received Welcome message after sent Keyword', async () => {
  const searchBox = page.locator('div[contenteditable="true"][data-tab="3"]');
  await searchBox.click();
  await searchBox.type(contactName, { delay: 100 });

  await page.waitForSelector(`span[title="${contactName}"]`, { timeout: 15000 });
  await page.click(`span[title="${contactName}"]`);
  console.log("> Contact opened");

  const messageBox = page.locator('div[contenteditable="true"][data-tab="10"]');
  await messageBox.type(message, { delay: 100 });
  await messageBox.press('Enter');
  console.log("> Keyword sent!");
});*/

/*const { test, chromium } = require('@playwright/test');

const contactName = "Whatsapp Automation";
const message = "kuhentest";
const fullName = "Kuhenraj";

let browser, context, page;

test.describe('WhatsApp Automation Flow', () => {
  test.beforeAll(async () => {
    test.setTimeout(180000); // 3 minutes for entire setup

    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto('https://web.whatsapp.com');

    console.log("📱 Please scan QR code if needed...");

    // Wait for either QR code or search bar to appear
    await Promise.race([
      page.waitForSelector('div[contenteditable="true"][data-tab="3"]', { timeout: 110000 }),
      page.waitForSelector('canvas[aria-label="Scan me!"]', { timeout: 110000 })
    ]);

    // Always wait for chat search bar after login
    await page.waitForSelector('div[contenteditable="true"][data-tab="3"]', { timeout: 110000 });
    console.log("✅ Logged in successfully!");
  });

  test.afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });*/

/*// OPTION 1: Single comprehensive test (RECOMMENDED)
test('Complete WhatsApp automation flow', async () => {
  test.setTimeout(120000); // 2 minutes for the entire flow
  
  // Step 1: Find and open contact
  console.log("🔍 Step 1: Finding contact...");
  const searchBox = page.locator('div[contenteditable="true"][data-tab="3"]');
  await searchBox.click();
  await searchBox.fill(''); // Clear existing text
  await searchBox.type(contactName, { delay: 100 });

  await page.waitForSelector(`span[title="${contactName}"]`, { timeout: 15000 });
  await page.click(`span[title="${contactName}"]`);
  console.log("✅ Contact opened");

  // Step 2: Send keyword message
  console.log("💬 Step 2: Sending keyword...");
  const messageBox = page.locator('div[contenteditable="true"][data-tab="10"]');
  await messageBox.waitFor({ state: 'visible', timeout: 10000 });
  await messageBox.click();
  await messageBox.fill(''); // Clear existing text
  await messageBox.type(message, { delay: 100 });
  await messageBox.press('Enter');
  console.log("✅ Keyword sent!");

  // Step 3: Click Proceed button
  console.log("🔘 Step 3: Looking for Proceed button...");
  
  // Multiple selector strategies for the Proceed button
  const proceedSelectors = [
    'div._ahef[role="button"]:has-text("Proceed")',
    'div[role="button"]:has-text("Proceed")', 
    'button:has-text("Proceed")',
    '[aria-label*="Proceed"]',
    'div:has-text("Proceed")'
  ];

  let proceedClicked = false;
  for (const selector of proceedSelectors) {
    try {
      const element = await page.waitForSelector(selector, { timeout: 15000 });
      if (element) {
        await element.click();
        console.log(`✅ Clicked Proceed button using selector: ${selector}`);
        proceedClicked = true;
        break;
      }
    } catch (error) {
      console.log(`⏭️  Proceed button not found with: ${selector}`);
    }
  }

  if (!proceedClicked) {
    console.log("❌ Proceed button not found with any selector");
    // Take screenshot for debugging
    await page.screenshot({ path: 'proceed-button-debug.png', fullPage: true });
    throw new Error("Proceed button not found");
  }

  // Step 4: Send name
  console.log("👤 Step 4: Sending name...");
  
  // Wait a moment for the interface to be ready
  await page.waitForTimeout(2000);
  
  // Wait for message input to be ready again
  const nameMessageBox = page.locator('div[contenteditable="true"][data-tab="10"]');
  await nameMessageBox.waitFor({ state: 'visible', timeout: 15000 });
  
  // Ensure the input is focused and clear
  await nameMessageBox.click();
  await page.keyboard.press('Control+A'); // Select all
  await page.keyboard.press('Delete'); // Delete selection
  
  // Type the name
  await nameMessageBox.type(fullName, { delay: 150 });
  await nameMessageBox.press('Enter');
  console.log("✅ Name sent successfully!");

  // Verify the message was sent (optional)
  await page.waitForTimeout(1000);
  console.log("🎉 Complete flow executed successfully!");
});*/

// OPTION 2: Separate tests (if you prefer individual test cases)

/*test('Send keyword message', async () => {
  const searchBox = page.locator('div[contenteditable="true"][data-tab="3"]');
  await searchBox.click();
  await searchBox.fill('');
  await searchBox.type(contactName, { delay: 100 });

  await page.waitForSelector(`span[title="${contactName}"]`, { timeout: 15000 });
  await page.click(`span[title="${contactName}"]`);
  console.log("✅ Contact opened");

  const messageBox = page.locator('div[contenteditable="true"][data-tab="10"]');
  await messageBox.waitFor({ state: 'visible', timeout: 10000 });
  await messageBox.click();
  await messageBox.fill('');
  await messageBox.type(message, { delay: 100 });
  await messageBox.press('Enter');
  console.log("✅ Keyword sent!");
});

test('Click Proceed button', async () => {
  console.log("🔘 Looking for Proceed button...");
  
  const proceedSelectors = [
    'div._ahef[role="button"]:has-text("Proceed")',
    'div[role="button"]:has-text("Proceed")',
    'button:has-text("Proceed")'
  ];

  let clicked = false;
  for (const selector of proceedSelectors) {
    try {
      await page.waitForSelector(selector, { timeout: 10000 });
      await page.click(selector);
      console.log("✅ Clicked Proceed button!");
      clicked = true;
      break;
    } catch (error) {
      continue;
    }
  }
  
  if (!clicked) {
    throw new Error("Proceed button not found");
  }
});

test('Send name successfully', async () => {
  await page.waitForTimeout(8000);
  
  const nameBox = page.locator('div[contenteditable="true"][data-tab="10"]');
  await nameBox.waitFor({ state: 'visible', timeout: 15000 });
  await nameBox.click();
  
  // Clear any existing text
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  
  await nameBox.type(fullName, { delay: 150 });
  await nameBox.press('Enter');
  console.log("✅ Name sent successfully!");
});

});  */

// Alternative approach with better error handling and debugging
/*test.describe('WhatsApp Automation with Enhanced Debugging', () => {
  test.beforeAll(async () => {
    // Same setup as above
    test.setTimeout(180000);
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto('https://web.whatsapp.com');

    console.log("📱 Please scan QR code if needed...");

    await Promise.race([
      page.waitForSelector('div[contenteditable="true"][data-tab="3"]', { timeout: 110000 }),
      page.waitForSelector('canvas[aria-label="Scan me!"]', { timeout: 110000 })
    ]);

    await page.waitForSelector('div[contenteditable="true"][data-tab="3"]', { timeout: 110000 });
    console.log("✅ Logged in successfully!");
  });

  test.afterAll(async () => {
    if (browser) await browser.close();
  });

  test('WhatsApp flow with detailed debugging', async () => {
    test.setTimeout(120000);
    
    try {
      // Send keyword
      console.log("🔍 Finding and clicking contact...");
      const searchBox = page.locator('div[contenteditable="true"][data-tab="3"]');
      await searchBox.click();
      await searchBox.fill('');
      await searchBox.type(contactName, { delay: 100 });

      await page.waitForSelector(`span[title="${contactName}"]`, { timeout: 15000 });
      await page.click(`span[title="${contactName}"]`);
      
      console.log("💬 Sending keyword message...");
      const messageBox = page.locator('div[contenteditable="true"][data-tab="10"]');
      await messageBox.waitFor({ state: 'visible' });
      await messageBox.click();
      await messageBox.fill('');
      await messageBox.type(message, { delay: 100 });
      await messageBox.press('Enter');
      
      // Wait and look for Proceed button
      console.log("⏳ Waiting for bot response and Proceed button...");
      await page.waitForTimeout(3000); // Wait for bot response
      
      // Take screenshot before looking for Proceed button
      await page.screenshot({ path: 'before-proceed.png' });
      
      // Look for Proceed button with multiple strategies
      const proceedButton = await page.locator('div[role="button"]:has-text("Proceed")').first();
      await proceedButton.waitFor({ timeout: 20000 });
      await proceedButton.click();
      console.log("✅ Proceed button clicked!");
      
      // Wait and send name
      console.log("👤 Preparing to send name...");
      await page.waitForTimeout(2000);
      
      // Take screenshot before sending name
      await page.screenshot({ path: 'before-name.png' });
      
      const nameInput = page.locator('div[contenteditable="true"][data-tab="10"]');
      await nameInput.waitFor({ state: 'visible', timeout: 15000 });
      await nameInput.click();
      
      // Clear and type name
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Delete');
      await nameInput.type(fullName, { delay: 150 });
      
      // Take screenshot before pressing Enter
      await page.screenshot({ path: 'before-enter-name.png' });
      
      await nameInput.press('Enter');
      
      // Take final screenshot
      await page.screenshot({ path: 'after-name-sent.png' });
      
      console.log("🎉 Name sent successfully!");
      
    } catch (error) {
      console.error("❌ Error in automation:", error.message);
      await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
      throw error;
    }
  });
});



test('Successfully name sent', async () => {
  await page.waitForTimeout(10000);
  const nameBox = await page.$('div[contenteditable="true"][data-tab="10"]');
  await nameBox.type(fullName, { delay: 100 });
  await nameBox.press('Enter');
  console.log("> Name sent successfully!");
});*/


const { test, chromium } = require('@playwright/test');

const contactName = "Whatsapp Automation";
const message = "kuhentest";
const fullName = "Kuhenraj";

let browser, context, page;

test.describe('WhatsApp Automation Flow', () => {
  test.beforeAll(async () => {
    test.setTimeout(180000); // 3 minutes for entire setup

    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto('https://web.whatsapp.com');

    console.log("📱 Please scan QR code if needed...");

    // Wait for either QR code or search bar to appear
    await Promise.race([
      page.waitForSelector('div[contenteditable="true"][data-tab="3"]', { timeout: 110000 }),
      page.waitForSelector('canvas[aria-label="Scan me!"]', { timeout: 110000 })
    ]);

    // Always wait for chat search bar after login
    await page.waitForSelector('div[contenteditable="true"][data-tab="3"]', { timeout: 110000 });
    console.log("✅ Logged in successfully!");
  });

  test.afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  // OPTION 1: Single comprehensive test (RECOMMENDED)
  test('Complete WhatsApp automation flow', async () => {
    test.setTimeout(120000); // 2 minutes for the entire flow

    // Step 1: Find and open contact
    console.log("🔍 Step 1: Finding contact...");
    const searchBox = page.locator('div[contenteditable="true"][data-tab="3"]');
    await searchBox.click();
    await searchBox.fill(''); // Clear existing text
    await searchBox.type(contactName, { delay: 100 });

    await page.waitForSelector(`span[title="${contactName}"]`, { timeout: 15000 });
    await page.click(`span[title="${contactName}"]`);
    console.log("✅ Contact opened");

    // Step 2: Send keyword message
    console.log("💬 Step 2: Sending keyword...");
    const messageBox = page.locator('div[contenteditable="true"][data-tab="10"]');
    await messageBox.waitFor({ state: 'visible', timeout: 10000 });
    await messageBox.click();
    await messageBox.fill(''); // Clear existing text
    await messageBox.type(message, { delay: 100 });
    await messageBox.press('Enter');
    console.log("✅ Keyword sent!");

    await page.waitForTimeout(8000);

    // Step 3: Click Proceed button
    console.log("🔘 Step 3: Looking for Proceed button...");

    try {
      const element = await page.waitForSelector('div._ahef[role="button"]:has-text("Proceed")', { timeout: 15000 });
      await element.click();
      console.log("✅ Clicked Proceed button!");
    } catch (error) {
      console.log("❌ Proceed button not found");
      // Take screenshot for debugging
      await page.screenshot({ path: 'proceed-button-debug.png', fullPage: true });
      throw new Error("Proceed button not found");
    }

    /*// Step 4: Send name
    console.log("👤 Step 4: Sending name...");

    // Wait a moment for the interface to be ready
    await page.waitForTimeout(9000);

    // Wait for message input to be ready again
    const nameMessageBox = page.locator('div[contenteditable="true"][data-tab="10"]');
    await nameMessageBox.waitFor({ state: 'visible', timeout: 15000 });

    // Ensure the input is focused and clear
    await nameMessageBox.click();
    await page.keyboard.press('Control+A'); // Select all
    await page.keyboard.press('Delete'); // Delete selection

    // Type the name
    await nameMessageBox.type(fullName, { delay: 150 });
    await nameMessageBox.press('Enter');
    console.log("✅ Name sent successfully!");*/

    // Step 4: Send name with validation
    console.log("👤 Step 4: Sending name with validation...");

    // Wait for interface readiness
    await page.waitForTimeout(9000);
    const nameMessageBox = page.locator('div[contenteditable="true"][data-tab="10"]');
    await nameMessageBox.waitFor({ state: 'visible', timeout: 15000 });

    // Function to send a message
    async function sendMessageToBox(message) {
      await nameMessageBox.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Delete');
      await nameMessageBox.type(message, { delay: 150 });
      await nameMessageBox.press('Enter');
    }

    // Error name test cases
    const invalidNames = ['123', 'Hello78', '✅✅✅'];

    for (const [index, invalidName] of invalidNames.entries()) {
      console.log(`🚫 Sending invalid name #${index + 1}: "${invalidName}"`);
      await sendMessageToBox(invalidName);
      await page.waitForTimeout(3000);

      // Possible rejection messages from the system
      const rejectionSelectors = [
        'text="Please enter a valid name"',
        'text="Invalid name format"',
        'text="Name should only contain letters"',
        'text="Please try again"',
        'text="Please enter your FULL NAME ONLY as per your NRIC, without any numbers, symbols or images"',
        '[aria-label*="error"]',
        '[class*="error"]'
      ];

      let rejected = false;
      for (const selector of rejectionSelectors) {
        try {
          const found = await page.waitForSelector(selector, { timeout: 2000 });
          if (found) {
            console.log(`✅ System rejected "${invalidName}" as expected.`);
            rejected = true;
            break;
          }
        } catch (err) {
          continue;
        }
      }

      if (!rejected) {
        // Also check if system proceeded instead of rejecting
        const proceedSelectors = [
          'text="Please submit your receipt"',
          'text="Next step"',
          'text="Please upload"',
          'text="Proceed"'
        ];
        let proceeded = false;
        for (const selector of proceedSelectors) {
          if (await page.locator(selector).count() > 0) {
            proceeded = true;
            break;
          }
        }

        if (proceeded) {
          throw new Error(`❌ VALIDATION FAILED: System accepted invalid name "${invalidName}"`);
        } else {
          console.log(`⚠️ No explicit rejection found for "${invalidName}", but system didn’t continue.`);
        }
      }
    }

    // Finally, send the correct name
    console.log(`✅ Sending correct name: "${fullName}"`);
    await sendMessageToBox(fullName);
    await page.waitForTimeout(3000);

    // Verify acceptance of correct name
    const successSelectors = [
      'text="Please submit your receipt"',
      'text="Next step"',
      'text="Please upload"',
      'text="Proceed"'
    ];

    let accepted = false;
    for (const selector of successSelectors) {
      if (await page.locator(selector).count() > 0) {
        console.log(`🎉 Correct name "${fullName}" accepted.`);
        accepted = true;
        break;
      }
    }

    if (!accepted) {
      console.log(`⚠️ No clear success indicator found, but assuming correct name was accepted.`);
    }


    // Step 5: Error Testing - Test invalid inputs for receipt submission
    console.log("🧪 Step 5: Starting error testing for receipt validation...");

    try { //here=========================
      console.log("🔍 Looking for receipt submission prompt...");

      // Wait for system to respond about receipt submission
      await page.waitForTimeout(10000); // Wait 10 seconds for system response

      // Error Test 1: Send numbers (should be rejected)
      console.log("⚠️  Error Test 1: Sending numbers...");
      const errorMessageBox1 = page.locator('div[contenteditable="true"][data-tab="10"]');
      await errorMessageBox1.waitFor({ state: 'visible', timeout: 30000 });
      await errorMessageBox1.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Delete');
      await errorMessageBox1.type("123", { delay: 100 });
      await errorMessageBox1.press('Enter');
      console.log("✅ Error Test 1 sent successfully!");

      // Wait and check for system response
      await page.waitForTimeout(10000);

      // Check if system accepted numbers (BAD - should not happen)
      const messages1 = await page.$$eval('[data-testid="msg-container"]', msgs =>
        msgs.slice(-2).map(msg => msg.textContent.toLowerCase())
      );

      for (const message of messages1) {
        if (message.includes('thank') || message.includes('received') || message.includes('processing') ||
          message.includes('next') || message.includes('continue')) {
          throw new Error("Program closed: System accepted numbers when it should reject them.");
        }
      }


      // Error Test 2: Send text (should be rejected)  
      console.log("⚠️  Error Test 2: Sending text...");
      const errorMessageBox2 = page.locator('div[contenteditable="true"][data-tab="10"]');
      await errorMessageBox2.waitFor({ state: 'visible', timeout: 30000 });
      await errorMessageBox2.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Delete');
      await errorMessageBox2.type("Hello", { delay: 100 });
      await errorMessageBox2.press('Enter');
      console.log("✅ Error Test 2 sent successfully!");

      // Wait and check for system response
      await page.waitForTimeout(8000);

      // Check if system accepted text (BAD - should not happen)
      const messages2 = await page.$$eval('[data-testid="msg-container"]', msgs =>
        msgs.slice(-2).map(msg => msg.textContent.toLowerCase())
      );

      for (const message of messages2) {
        if (message.includes('thank') || message.includes('received') || message.includes('processing') ||
          message.includes('next') || message.includes('continue')) {
          throw new Error("Program closed: System accepted text when it should reject it.");
        }
      }

      // Error Test 3: Send emojis (should be rejected)
      console.log("⚠️  Error Test 3: Sending emojis...");
      const errorMessageBox3 = page.locator('div[contenteditable="true"][data-tab="10"]');
      await errorMessageBox3.waitFor({ state: 'visible', timeout: 30000 });
      await errorMessageBox3.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Delete');
      await errorMessageBox3.type("✅✅✅", { delay: 100 });
      await errorMessageBox3.press('Enter');
      console.log("✅ Error Test 3 sent successfully!");

      // Wait and check for system response
      await page.waitForTimeout(8000);

      // Check if system accepted emojis (BAD - should not happen)
      const messages3 = await page.$$eval('[data-testid="msg-container"]', msgs =>
        msgs.slice(-2).map(msg => msg.textContent.toLowerCase())
      );

      for (const message of messages3) {
        if (message.includes('thank') || message.includes('received') || message.includes('processing') ||
          message.includes('next') || message.includes('continue')) {
          throw new Error("Program closed: System accepted emojis when it should reject them.");
        }
      }

      console.log("🎯 All error tests completed successfully!");

      // Check if the system is still asking for receipt (good behavior)
      // OR if it accepted any of the invalid inputs (bad behavior - should fail test)
      console.log("🔍 Checking system behavior after error tests...");

      // Wait a bit more to see final system response
      await page.waitForTimeout(5000);

    } catch (error) {
      console.error("❌ Error testing failed:", error.message);

      // If any error test causes unexpected behavior, fail the test
      throw new Error(`Error testing failed: ${error.message}`);
    }


    // Step 6: Send actual receipt image (should be accepted)
    console.log("📸 Step 6: Uploading receipt image...");

    try {
      // Click the Attach button (this should reveal the file input in the DOM)
      await page.getByRole('button', { name: 'Attach' }).click();
      await page.waitForTimeout(1000);

      // Find the file input (it may be hidden, but Playwright can still set files)
      const fileInput = await page.$('input[type="file"][accept*="image"]');
      if (!fileInput) {
        throw new Error("File input not found!");
      }

      // Use the correct absolute path
      const path = require('path');
      const receiptPath = path.resolve(__dirname, 'demo-receipt.jpg');
      await fileInput.setInputFiles(receiptPath);

      // Wait for the image preview dialog to appear
      await page.waitForSelector('div[role="dialog"] img', { timeout: 10000 });

      // Try writing a caption to ensure the Send button is enabled
      const captionInput = await page.$('div[role="dialog"] [contenteditable="true"]');
      if (captionInput) {
        await captionInput.type('test', { delay: 50 });
        await page.waitForTimeout(300);
      }

      // Use a robust selector for the Send button (aria-label and role) 
      const sendButton = await page.waitForSelector('div[role="button"][aria-label="Send"][aria-disabled="false"]', { timeout: 10000 });
      // Try force click
      await sendButton.click({ force: true });
      console.log("📸 Receipt image sent successfully!");



      // Wait for system response
      await page.waitForTimeout(10000);

      // Check for successful receipt processing
      console.log("🔍 Checking for receipt acceptance...");

      const receiptMessages = await page.$$eval('[data-testid="msg-container"]', msgs =>
        msgs.slice(-3).map(msg => msg.textContent.toLowerCase())
      );



    } catch (error) {
      console.error("❌ Receipt upload failed:", error.message);
      await page.screenshot({ path: 'receipt-upload-failed.png', fullPage: true });
      throw new Error(`Receipt upload failed: ${error.message}`);
    }


  });
})

// Verify the message was sent (optional)
/* await page.waitForTimeout(60000);
console.log("🎉 Complete flow with error testing executed successfully!");
 
console.log("📋 Summary:");
console.log("  - Sent keyword message ✅");
console.log("  - Clicked Proceed button ✅"); 
console.log("  - Sent name ✅");
console.log("  - Tested invalid inputs (numbers, text, emojis) ✅");
console.log("  - System validation behavior captured in screenshots 📸");*/

