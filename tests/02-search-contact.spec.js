const { test, expect, chromium } = require('@playwright/test');

// Configuration - Change these values as needed
const CONFIG = {
    contactName: "Testing Contact",
    contactNumber: "+60 11-2635 2582" // +60 11-3677 1899 / +60 3-9771 1660 - TDG Add your contact's phone number here
};

test.describe('WhatsApp Contact Search Tests', () => {
    let browser, context, page;

    test.beforeAll(async () => {
        test.setTimeout(300000); // 5 minutes for setup

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

        console.log("📱 Opening WhatsApp Web...");
        await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle' });
        await page.waitForTimeout(5000);

        // Handle QR code scanning once for all tests
        try {
            const qrCode = await page.waitForSelector('canvas[aria-label="Scan me!"]', { timeout: 5000 });
            if (qrCode) {
                console.log("📱 QR Code found! Please scan it to continue...");
                await page.screenshot({ path: 'screenshots/qr-code.png', fullPage: true });
            }
        } catch {
            console.log("ℹ️ No QR code found - checking login status.");
        }

        // Wait for login completion
        await page.waitForSelector('div[contenteditable="true"][data-tab="3"]', { timeout: 120000 });
        console.log("✅ Logged in successfully! Ready for contact search tests.");
    });

    test.afterAll(async () => {
        if (browser) {
            console.log("🔄 Closing browser...");
            await browser.close();
        }
    });

    test('Search and open contact by name or phone number', async () => {
        test.setTimeout(180000); // 3 minutes

        try {
            // Step: Search for contact (by name first, then by number if not found)
            await test.step('Search for contact by name or phone number', async () => {
                console.log(`🔍 Searching for contact: ${CONFIG.contactName}`);

                // Look for search box with multiple possible selectors
                const searchSelectors = [
                    '[data-testid="chat-list-search"]',
                    'div[contenteditable="true"][data-tab="3"]',
                    'div[contenteditable="true"]'
                ];

                let searchBox = null;
                for (const selector of searchSelectors) {
                    try {
                        searchBox = await page.waitForSelector(selector, { timeout: 10000 });
                        if (searchBox) {
                            console.log(`📍 Found search box with selector: ${selector}`);
                            break;
                        }
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
                const contactByNameSelectors = [
                    `span[title="${CONFIG.contactName}"]`,
                    `span[title*="${CONFIG.contactName}"]`,
                    '[data-testid="cell-frame-container"]',
                    'div[role="listitem"]'
                ];

                let contactFound = false;
                for (const selector of contactByNameSelectors) {
                    try {
                        const contactElement = await page.waitForSelector(selector, { timeout: 5000 });
                        if (contactElement) {
                            console.log(`📱 Found contact by name with selector: ${selector}`);
                            await contactElement.click();
                            await page.waitForTimeout(3000);
                            await page.screenshot({ path: 'screenshots/contact-opened-by-name.png', fullPage: true });
                            console.log(`✅ Contact "${CONFIG.contactName}" opened successfully`);
                            contactFound = true;
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }

                // Second try: If not found by name, try phone number
                if (!contactFound && CONFIG.contactNumber) {
                    console.log(`📞 Contact not found by name, trying phone number: ${CONFIG.contactNumber}`);

                    // Clear search and try phone number
                    await searchBox.click();
                    await page.keyboard.press('Control+A');
                    await page.keyboard.press('Delete');
                    await searchBox.type(CONFIG.contactNumber, { delay: 100 });
                    await page.waitForSelector('[data-testid="cell-frame-container"], div[role="listitem"]', { timeout: 1000 }).catch(() => { });

                    // Look for contact result by phone number
                    const contactByNumberSelectors = [
                        `span[title*="${CONFIG.contactNumber}"]`,
                        `span[title="${CONFIG.contactNumber}"]`,
                        '[data-testid="cell-frame-container"]',
                        'div[role="listitem"]'
                    ];

                    for (const selector of contactByNumberSelectors) {
                        try {
                            const contactElement = await page.waitForSelector(selector, { timeout: 5000 });
                            if (contactElement) {
                                console.log(`📱 Found contact by phone number with selector: ${selector}`);
                                await contactElement.click();
                                await page.waitForTimeout(3000);
                                await page.screenshot({ path: 'screenshots/contact-opened-by-number.png', fullPage: true });
                                console.log(`✅ Contact "${CONFIG.contactNumber}" opened successfully`);
                                contactFound = true;
                                break;
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                }

                if (!contactFound) {
                    console.log("⚠️ Could not find contact by name or phone number");
                    await page.screenshot({ path: 'screenshots/contact-not-found.png', fullPage: true });
                    throw new Error(`Contact not found: ${CONFIG.contactName} / ${CONFIG.contactNumber}`);
                }
            });

            await test.step('Verify contact chat is opened', async () => {
                console.log("✅ Verifying contact chat is opened...");

                // Verify we're in a chat by looking for message input or chat header
                const chatVerificationSelectors = [
                    'div[contenteditable="true"][data-tab="10"]', // Message input
                    'div[data-testid="conversation-compose-box-input"]',
                    'header[data-testid="conversation-header"]'
                ];

                let chatOpened = false;
                for (const selector of chatVerificationSelectors) {
                    try {
                        const chatElement = await page.waitForSelector(selector, { timeout: 8000 });
                        if (chatElement) {
                            console.log(`✅ Chat verified with selector: ${selector}`);
                            await page.screenshot({ path: 'screenshots/chat-verification.png', fullPage: true });
                            chatOpened = true;
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }

                if (!chatOpened) {
                    throw new Error('Could not verify that chat is opened');
                }

                console.log("🎉 Contact chat opened successfully!");
            });

            console.log("🎉 Contact search and open completed successfully!");

        } catch (error) {
            console.error(`❌ Error in contact search: ${error.message}`);

            // Take screenshot for debugging
            await page.screenshot({
                path: `test-results/contact-search-error-${Date.now()}.png`,
                fullPage: true
            });

            throw error;
        }

        // Keep browser open for inspection in non-CI environments
        if (!process.env.CI) {
            console.log("> Browser will remain open for inspection...");
            await page.waitForTimeout(10000);
        }
    });
});