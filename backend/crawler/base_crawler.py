from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time, random

class BaseCrawler:
    def __init__(self, headless=True):
        options = Options()
        if headless:
            options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        # 봇 감지 우회
        options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 10)

    def get(self, url: str):
        self.driver.get(url)
        time.sleep(random.uniform(1.5, 3.0))  # 요청 간격 랜덤화

    def quit(self):
        self.driver.quit()