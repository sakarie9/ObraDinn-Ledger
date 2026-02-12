from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Load the app
        print("Loading app...")
        page.goto("http://localhost:8080")

        # Click first face
        page.locator(".grid-item img").first.click()
        page.wait_for_selector(".detail-view")
        print("Detail view loaded.")

        # Click "Get New Hint"
        btn = page.locator("#hint-btn-identity")
        if btn.count() > 0:
            # Check button position relative to container bottom
            # Since we have fixed height card, the button should be at the bottom
            # The .hint-column is 450px height. The button margin-top: auto pushes it down.

            # Let's verify the button doesn't move relative to the viewport after click
            bbox_before = btn.bounding_box()
            print(f"Button Y before: {bbox_before['y']}")

            btn.click()
            page.wait_for_timeout(500)

            bbox_after = btn.bounding_box()
            # If button exists (not removed because hints remain)
            if bbox_after:
                print(f"Button Y after: {bbox_after['y']}")
                if abs(bbox_before['y'] - bbox_after['y']) < 5:
                    print("Button position verified stable.")
                else:
                    print("Button moved.")
            else:
                print("Button removed (last hint revealed).")

            page.screenshot(path="verification/final_stability_check.png")
        else:
            print("Button not found.")

        browser.close()

if __name__ == "__main__":
    run()
