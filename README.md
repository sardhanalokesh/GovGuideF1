# GovernGuide

> Your personal assistant for navigating Indian government services—just ask in natural language.

🌐 Live Demo: [https://governguide.netlify.app](https://governguide.netlify.app)

---

🚀 Overview

GovernGuide is a smart assistant that helps users interact with Indian government services via **natural language**. Whether it's about getting a new PAN card or applying for a government scholarship, users can describe their situation, and GovernGuide will guide them with relevant information directly from [india.gov.in](https://www.india.gov.in/).

This system leverages **large language models (LLMs)** and **web scraping** to deliver relevant, contextual answers.

---

## 🧠 How It Works

1. **User Input (Natural Language)**
   The user describes their need in plain English or any natural human language.

2. **Keyword Generation via LLM (Sarvam API)**
   A Python backend sends the user query to **Sarvam LLM**, which returns a set of keywords.

3. **Data Extraction via Web Scraping**
   The keywords are used to scrape relevant data from \[india.gov.in] using a custom **Python-based web scraper**.

4. **Inter-Service Communication**

   * A **Node.js Express backend** handles incoming client requests.
   * It coordinates with the Python scraper (via internal API call) and gets the scraped data.

5. **Second LLM Call for Summary/Answer**
   The scraped data is then combined with the original user prompt and sent again to **Sarvam LLM**, generating a summarized or refined answer.

6. **Final Response to User**
   The user sees both:

   * The **raw scraped content**
   * The **LLM-generated summary or response**

---

## 🏗️ Architecture

```
[ Frontend (Netlify) ]
        |
        v
[ Node.js Backend (Express.js) ]
        |
        |------> [ Python Web Scraper + Sarvam LLM (Keywords) ]
        |                    |
        |                    --> Scrapes data from india.gov.in
        |
        |------> [ Sarvam LLM (Summary Generation) ]
        |
        v
[ Final Combined Output Returned to User ]
```

---

## ☁️ Deployment

* **Frontend**: [Netlify](https://www.netlify.com/)
* **Backends** (Python + Node.js): Hosted on **Google Cloud**
* **Domain**: [https://governguide.netlify.app](https://governguide.netlify.app)

---

## 🔧 Tech Stack

* **Frontend**: React + Tailwind CSS
* **Backend 1**: Node.js (Express) – API Orchestration
* **Backend 2**: Python – Web Scraper + LLM Keyword Generator
* **LLM**: Sarvam AI APIs (used twice in the flow)
* **Scraping Target**: [https://www.india.gov.in](https://www.india.gov.in)
* **Hosting**: Google Cloud Platform (Cloud Run)

---

## 📦 Installation (For Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/venkateshwarareddykalam/GovernGuide.git
cd GovernGuide
```

### 2. Set Up Python Backend

```bash
cd webscraper
pip install -r requirements.txt
python main.py
```

### 3. Set Up Node.js Backend

```bash
cd backend
npm install
node index.js
```

### 4. Run Frontend (Optional if modifying UI)

```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Example Queries

* "How can I apply for a government scholarship for girls?"
* "My ration card is expired. What is the renewal process?"
