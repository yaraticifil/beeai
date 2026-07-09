import asyncio
from playwright.async_api import async_playwright
import os

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 400, 'height': 2000})
        page = await context.new_page()

        try:
            await page.goto("http://localhost:8081", timeout=60000)
            await page.wait_for_timeout(10000)

            # Skip onboarding
            login_link = page.get_by_text("Giriş Yap").first
            await login_link.click()
            await page.wait_for_timeout(2000)

            # Login
            await page.get_by_placeholder("Firma adınızı giriniz").fill("Test Firması")
            await page.get_by_placeholder("05XX XXX XX XX").fill("05555555555")
            await page.get_by_text("Giriş Yap").last.click()
            await page.wait_for_timeout(5000)

            # Scroll to agents
            await page.get_by_text("Arı Kovanın").scroll_into_view_if_needed()
            await page.wait_for_timeout(2000)

            os.makedirs("verification/screenshots", exist_ok=True)
            await page.screenshot(path="verification/screenshots/agent_cards.png")
            print("Agent cards screenshot saved.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())
