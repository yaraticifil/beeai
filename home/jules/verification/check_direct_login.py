import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        print("Navigating to /login directly...")
        await page.goto("http://localhost:8081/login")

        await page.wait_for_timeout(5000)
        print(f"Current URL: {page.url}")

        # Take a screenshot to see where we are
        await page.screenshot(path="/home/jules/verification/screenshots/direct_login.png")

        # Look for inputs
        inputs = await page.query_selector_all("input")
        print(f"Found {len(inputs)} inputs")
        for i, input_el in enumerate(inputs):
            placeholder = await input_el.get_attribute("placeholder")
            aria_label = await input_el.get_attribute("aria-label")
            print(f"Input {i}: placeholder='{placeholder}', aria-label='{aria_label}'")

        if len(inputs) == 0:
            # Maybe they are not <input> but something else?
            # RN Web often uses <input type="text">
            # Let's dump content if no inputs found
            content = await page.content()
            with open("/home/jules/verification/direct_login_dump.html", "w") as f:
                f.write(content)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
