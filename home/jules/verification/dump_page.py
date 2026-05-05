import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("http://localhost:8081")

        # Wait for potential redirects
        await page.wait_for_timeout(5000)

        # Click "Giriş Yap"
        try:
            # Try multiple ways to find "Giriş Yap" link in the header
            login_link = page.get_by_text("Giriş Yap", exact=True).nth(0)
            await login_link.click(force=True)
            print("Clicked 'Giriş Yap' link")
        except Exception as e:
            print(f"Could not click 'Giriş Yap' link: {e}")

        await page.wait_for_timeout(2000)

        # Dump content
        content = await page.content()
        with open("/home/jules/verification/page_dump.html", "w") as f:
            f.write(content)

        print(f"Page URL: {page.url}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
