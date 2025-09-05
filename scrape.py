from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

# Set up headless browser
options = Options()
options.headless = False  # Set to False if you want to see the browser

driver = webdriver.Chrome(options=options)

# Load the page
driver.get("https://www.india.gov.in/gsearch?s=startup&op=Search")

# Wait for JS to load content
time.sleep(5)  # You can also use WebDriverWait for more precise control

# Get rendered HTML
html = driver.page_source

# Save to file
with open("india_gov_startup_search.html", "w", encoding="utf-8") as f:
    f.write(html)

driver.quit()

print("Rendered HTML saved successfully.")
