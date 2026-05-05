import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("http://localhost:8081")

        # Wait for potential redirects
        await page.wait_for_timeout(3000)

        # Click "Giriş Yap" with force=True because of intercepting image
        try:
            login_link = page.locator('div[tabindex="0"]:has-text("Giriş Yap")')
            await login_link.click(force=True)
            print("Clicked 'Giriş Yap' link with force=True")
        except Exception as e:
            print(f"Could not click 'Giriş Yap' link: {e}")

        await page.wait_for_timeout(3000)
        print(f"Current URL: {page.url}")

        # Dump content of login page
        content = await page.content()
        with open("/home/jules/verification/login_page_dump.html", "w") as f:
            f.write(content)

        # Look for inputs
        inputs = await page.query_selector_all("input")
        print(f"Found {len(inputs)} inputs")
        for i, input_el in enumerate(inputs):
            placeholder = await input_el.get_attribute("placeholder")
            value = await input_el.get_attribute("value")
            print(f"Input {i}: placeholder='{placeholder}', value='{value}'")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
