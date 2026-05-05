import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("http://localhost:8081")

        # Wait for potential redirects
        await page.wait_for_timeout(3000)

        # Click "Giriş Yap"
        try:
            # Targeted click using CSS selector for the login link
            # In the dump it was: <div tabindex="0" class="css-view-g5y9jx r-cursor-1loqt21 r-touchAction-1otgn73 r-backgroundColor-91ejfr r-borderRadius-1q9bdsx r-paddingBlock-11f147o r-paddingInline-3pj75a"><div dir="auto" class="css-text-146c3p1 r-color-qsh3in r-fontFamily-iorfl6 r-fontSize-n6v787">Giriş Yap</div></div>
            login_link = page.locator('div[tabindex="0"]:has-text("Giriş Yap")')
            await login_link.click()
            print("Clicked 'Giriş Yap' link")
        except Exception as e:
            print(f"Could not click 'Giriş Yap' link: {e}")

        await page.wait_for_timeout(3000)
        print(f"Current URL: {page.url}")

        # Dump content of login page
        content = await page.content()
        with open("/home/jules/verification/login_page_dump.html", "w") as f:
            f.write(content)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
