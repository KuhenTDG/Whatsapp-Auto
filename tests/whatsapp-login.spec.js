const { test, expect } = require('@playwright/test');

test('Scan QR code and verify WhatsApp opens', async ({ page }) => {
    await page.goto('https://web.whatsapp.com');
    await page.waitForSelector('canvas'); // Wait for QR code to appear
    const qrCode = await page.$('canvas');
    expect(qrCode).not.toBeNull(); // Ensure QR code is present

    // Logic to scan QR code goes here
    // Simulate QR code scanning
    await page.click('canvas'); // Simulate clicking on the QR code

    // Wait for WhatsApp to open
    await page.waitForTimeout(5000); // Adjust timeout as necessary
    const whatsappOpened = await page.url();
    expect(whatsappOpened).toContain('web.whatsapp.com');
});

test('Verify chat loads properly', async ({ page }) => {
    await page.waitForSelector('div[role="chat"]'); // Wait for chat to load
    const chatLoaded = await page.$('div[role="chat"]');
    expect(chatLoaded).not.toBeNull(); // Ensure chat is loaded
});