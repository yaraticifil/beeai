import asyncio
from playwright.async_api import async_playwright
import os

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 400, 'height': 800})
        page = await context.new_page()

        try:
            print("Navigating to app...")
            await page.goto("http://localhost:8081", timeout=60000)
            await page.wait_for_timeout(15000)

            # Handle onboarding
            for _ in range(3):
                next_btn = page.get_by_text("Sonraki")
                if await next_btn.is_visible():
                    await next_btn.click()
                    await page.wait_for_timeout(1000)

            start_btn = page.get_by_text("Kovanı Başlat")
            if await start_btn.is_visible():
                await start_btn.click()
                await page.wait_for_timeout(3000)

            # Login
            if await page.get_by_placeholder("Firma adınızı giriniz").is_visible():
                await page.get_by_placeholder("Firma adınızı giriniz").fill("Test Firması")
                await page.get_by_placeholder("05XX XXX XX XX").fill("05555555555")
                await page.get_by_text("Giriş Yap").last.click()
                await page.wait_for_timeout(5000)

            # Dashboard
            os.makedirs("verification/screenshots", exist_ok=True)
            await page.screenshot(path="verification/screenshots/dashboard.png")
            print("Dashboard screenshot saved.")

            # Navigate to Labs
            await page.get_by_text("BeeAI Labs").click()
            await page.wait_for_timeout(2000)

            # Navigate to Garden
            # Use exact match for Bahçe module
            await page.get_by_text("Bahçe", exact=True).click()
            await page.wait_for_timeout(2000)

            # Garden
            await page.screenshot(path="verification/screenshots/garden.png")
            print("Garden screenshot saved.")

        except Exception as e:
            print(f"Error: {e}")
            await page.screenshot(path="verification/screenshots/error.png")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())
