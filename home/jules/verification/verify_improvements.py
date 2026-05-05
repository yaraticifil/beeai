import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # 1. Login
        await page.goto("http://localhost:8081/login")
        await page.wait_for_timeout(3000)

        # Fill login form
        await page.get_by_placeholder("Firma adınızı giriniz").fill("Test Corp")
        await page.get_by_placeholder("05XX XXX XX XX").fill("5554443322")
        await page.get_by_text("Giriş Yap").last.click()

        await page.wait_for_timeout(3000)
        print(f"Logged in, URL: {page.url}")

        # 2. Dashboard Verification
        await page.screenshot(path="/home/jules/verification/screenshots/dashboard.png")

        # Verify Bee Agent cards are present (Arı Ajanlar section)
        agent_cards = page.locator('text=İzci').or_(page.locator('text=Aracı')).or_(page.locator('text=Kâtip'))
        count = await agent_cards.count()
        print(f"Found {count} agent card matches")

        # Try to click an agent card (e.g. Kâtip)
        try:
            await page.get_by_text("Kâtip").first.click()
            print("Clicked Kâtip card")
            # Alert might pop up, but Playwright handles it or we just wait
            await page.wait_for_timeout(1000)
            await page.screenshot(path="/home/jules/verification/screenshots/dashboard_after_click.png")
        except Exception as e:
            print(f"Error clicking agent card: {e}")

        # 3. Check Upload (to verify Scribe bonus)
        await page.goto("http://localhost:8081/upload")
        await page.wait_for_timeout(2000)

        await page.get_by_placeholder("Örn: 00012345").fill("CH-12345")
        await page.get_by_placeholder("Örn: Kovan Tekstil A.Ş.").fill("Issuer Co")
        await page.get_by_placeholder("Örn: Garanti BBVA").fill("Bank X")
        await page.get_by_placeholder("185.000").fill("100000")
        await page.get_by_placeholder("31.12.2025").fill("01.01.2026")

        await page.screenshot(path="/home/jules/verification/screenshots/upload_filled.png")

        # Click submit
        await page.get_by_text("15 Dakika 3 Teklif Başlat").click()
        await page.wait_for_timeout(3000)

        print(f"After upload, URL: {page.url}")
        await page.screenshot(path="/home/jules/verification/screenshots/after_upload.png")

        # 4. Check Activities for XP/Honey bonus
        await page.goto("http://localhost:8081/") # Back to dashboard
        await page.wait_for_timeout(2000)

        # Scroll down to activities
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await page.wait_for_timeout(1000)
        await page.screenshot(path="/home/jules/verification/screenshots/dashboard_activities.png")

        await browser.close()

if __name__ == "__main__":
    if not os.path.exists("/home/jules/verification/screenshots"):
        os.makedirs("/home/jules/verification/screenshots")
    asyncio.run(run())
