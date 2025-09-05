from flask import Flask, jsonify,request
from bs4 import BeautifulSoup
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

app = Flask(__name__)

HTML_FILE = "india_gov_startup_search.html"

def extract_data_from_html(html_file):
    if not os.path.exists(html_file):
        return {"error": "HTML file not found."}

    with open(html_file, "r", encoding="utf-8") as f:
        html = f.read()

    soup = BeautifulSoup(html, "html.parser")
    results_data = []

    for result in soup.find_all("div", class_="gsc-webResult"):
        title_elem = result.find("a", class_="gs-title")
        desc_elem = result.find("div", class_="gs-bidi-start-align")

        title = title_elem.get_text(strip=True) if title_elem else None
        link = title_elem.get("href") if title_elem else None
        description = desc_elem.get_text(strip=True) if desc_elem else None

        if title and link:
            results_data.append({
                "title": title,
                "link": link,
                "description": description
            })

    return results_data

def scraper(topic):
    options = Options()
    options.headless = False  

    driver = webdriver.Chrome(options=options)
    topic.replace(" ","")
    driver.get("https://www.india.gov.in/gsearch?s="+str(topic)+"&op=Search")

    time.sleep(5)

    html = driver.page_source

    with open(str(topic)+".html", "w", encoding="utf-8") as f:
        f.write(html)

    driver.quit()

    print("Rendered HTML saved successfully.")

@app.route("/api", methods=["POST"])
def get():
    data = request.get_json()
    topic = data.get('topic')
    topic = topic.replace(" ","")
    if not os.path.exists(str(topic)+".html"):
        scraper(topic)
    data = extract_data_from_html(str(topic)+".html")
    #data = extract_data_from_html(HTML_FILE)
    if isinstance(data, dict) and "error" in data:
        return jsonify(data), 404
    return jsonify(data), 200

app.run(debug=True)
