import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # Set viewport to a mobile-like size
        context = await browser.new_context(viewport={'width': 390, 'height': 844})
        page = await context.new_page()

        print("Navigating to app...")
        await page.goto("http://localhost:8081")

        # Wait for the onboarding to load
        await page.wait_for_timeout(5000)
        await page.screenshot(path="verification/screenshots/onboarding.png")

        # Click "Giriş Yap" to skip onboarding
        print("Clicking 'Giriş Yap'...")
        try:
            # Using force=True because the hero image might overlap in some layouts
            await page.get_by_text("Giriş Yap").click(force=True)
        except Exception as e:
            print(f"Could not click 'Giriş Yap', trying 'Sonraki' flow. Error: {e}")
            for _ in range(3):
                await page.get_by_text("Sonraki").click()
                await page.wait_for_timeout(1000)

        await page.wait_for_timeout(2000)
        await page.screenshot(path="verification/screenshots/login_page.png")

        # Fill login form
        print("Filling login form...")
        await page.get_by_placeholder("Firma adınızı giriniz").fill("Test Firması")
        await page.get_by_placeholder("05XX XXX XX XX").fill("5554443322")
        await page.get_by_text("Giriş Yap").last.click() # The button is also "Giriş Yap"

        await page.wait_for_timeout(3000)
        await page.screenshot(path="verification/screenshots/dashboard.png")

        # Go to Lab to see shop (verify description fix)
        print("Navigating to Labs/Shop...")
        await page.goto("http://localhost:8081/labs/shop")
        await page.wait_for_timeout(2000)
        await page.screenshot(path="verification/screenshots/shop_fix.png")

        # Go to Offers
        print("Navigating to Offers...")
        await page.goto("http://localhost:8081/offers")
        await page.wait_for_timeout(2000)

        # Click on an offer card to open modal
        print("Opening offer modal...")
        # Since it's a dynamic list, we'll try to click the first offer card
        # Offer cards have "Detaylı Analiz" or similar text usually
        await page.get_by_text("Analiz Et").first.click()
        await page.wait_for_timeout(1000)
        await page.screenshot(path="verification/screenshots/offer_modal_with_coupons.png")

        await browser.close()
        print("Verification completed.")

if __name__ == "__main__":
    if not os.path.exists("verification/screenshots"):
        os.makedirs("verification/screenshots")
    asyncio.run(run())
