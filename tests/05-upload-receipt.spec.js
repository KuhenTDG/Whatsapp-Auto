const { test, expect, chromium } = require('@playwright/test');
const { loginAndOpenContact, sendMessageToBox, uploadReceipt } = require('./helpers/whatsapp-helpers');

// Test configuration
const TEST_CONFIG = {
    receiptPath: "demo-receipt.jpg" // Adjust path as needed
};

test.describe('WhatsApp Receipt Upload Tests', () => {
    test('Receipt error validation and upload', async () => {
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

            // Step 3: Receipt error validation tests
            await test.step('Receipt error validation tests', async () => {
                console.log("⚠️ Starting receipt error validation tests...");

                // Error Test 1: Send numbers (should be rejected)
                console.log("⚠️ Error Test 1: Sending numbers...");
                await sendMessageToBox(page, "123456");
                await page.waitForTimeout(8000);

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
                console.log("⚠️ Error Test 2: Sending text...");
                await sendMessageToBox(page, "Hello");
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
                console.log("⚠️ Error Test 3: Sending emojis...");
                await sendMessageToBox(page, "✅✅✅");
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

                // Check system behavior after error tests
                console.log("🔍 Checking system behavior after error tests...");
                await page.waitForTimeout(5000);

                await page.screenshot({ path: 'screenshots/after-error-tests.png', fullPage: true });
            });
//======================================================================================================================
            // Step 4: Auto upload receipt image
            await test.step('Auto upload receipt image', async () => {
                console.log("📸 Starting automatic receipt upload...");

                try {
                    await uploadReceipt(page, TEST_CONFIG.receiptPath);

                    // Wait for system response
                    await page.waitForTimeout(10000);

                    // Check for successful receipt processing
                    console.log("🔍 Checking for receipt acceptance...");

                    const receiptMessages = await page.$$eval('[data-testid="msg-container"]', msgs =>
                        msgs.slice(-3).map(msg => msg.textContent.toLowerCase())
                    );

                    console.log("📝 Recent messages after receipt upload:", receiptMessages);

                    // Look for success indicators
                    let receiptAccepted = false;
                    for (const message of receiptMessages) {
                        if (message.includes('thank') || message.includes('received') || message.includes('processing') ||
                            message.includes('success') || message.includes('approved')) {
                            console.log("✅ Receipt appears to have been accepted");
                            receiptAccepted = true;
                            break;
                        }
                    }

                    if (!receiptAccepted) {
                        // Look for error messages
                        for (const message of receiptMessages) {
                            if (message.includes('invalid') || message.includes('error') || message.includes('reject')) {
                                console.log("❌ Receipt appears to have been rejected");
                                break;
                            }
                        }
                        console.log("⚠️ Receipt status unclear - check screenshots");
                    }

                    await page.screenshot({ path: 'screenshots/receipt-upload-complete.png', fullPage: true });

                } catch (error) {
                    console.error("❌ Receipt upload failed:", error.message);
                    await page.screenshot({ path: 'screenshots/receipt-upload-failed.png', fullPage: true });

                    // Handle specific scenarios from senior's code
                    try {
                        // Check for image upload error message
                        const imageErrorMessage = await page.locator('text="Please upload an image using WhatsApp (click a camera icon and choose a photo)"').waitFor({ timeout: 3000 });
                        if (imageErrorMessage) {
                            console.log("❌ Found image upload error message");
                            throw new Error("Receipt upload validation failed: System requesting proper image upload");
                        }
                    } catch (e) {
                        // Check for unexpected success after error
                        try {
                            const successMessage = await page.locator('text="Thank you for your submission!"').waitFor({ timeout: 3000 });
                            if (successMessage) {
                                throw new Error("Test FAILED: Error sequence messages resulted in success message - this should not happen!");
                            }
                        } catch (e2) {
                            // Neither found - original error stands
                        }
                    }

                    throw error;
                }
            });

            console.log("🎉 Receipt upload workflow completed successfully!");

        } catch (error) {
            console.error(`❌ Error in receipt upload workflow: ${error.message}`);
            await page.screenshot({
                path: `test-results/receipt-workflow-error-${Date.now()}.png`,
                fullPage: true
            });
            throw error;
        }

        if (!process.env.CI) {
            console.log("Browser will remain open for inspection...");
            await page.waitForTimeout(10000);
        }
    });
});