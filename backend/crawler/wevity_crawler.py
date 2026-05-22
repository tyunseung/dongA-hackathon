from .base_crawler import BaseCrawler
from .classifier import classify
from selenium.webdriver.common.by import By

class WevityCrawler(BaseCrawler):
    BASE_URL = "https://www.wevity.com"
    LIST_URLS = [
        "/contest?cd=1&nt=1",
        "/activity?nt=1",
    ]

    def crawl(self) -> list[dict]:
        results = []
        for path in self.LIST_URLS:
            self.get(f"{self.BASE_URL}{path}")
            
            # li[2]부터 시작하므로 인덱스 2부터 순회
            idx = 2
            while True:
                try:
                    item_xpath = f'//*[@id="container"]/div[2]/div[1]/div[2]/div[3]/div/ul/li[{idx}]/div[1]/a'
                    item = self.driver.find_element(By.XPATH, item_xpath)
                    link = item.get_attribute("href")
                    
                    # 상세 페이지로 이동해서 수집
                    detail = self._get_detail(link)
                    if detail:
                        results.append({**detail, "source": "wevity"})
                    
                    idx += 1
                except Exception:
                    # 더 이상 li 항목이 없으면 종료
                    break
        
        return results

    def _get_detail(self, url: str) -> dict:
        self.get(url)
        try:
            title = self.driver.find_element(
                By.XPATH, '//*[@id="container"]/div[2]/div[1]/div[2]/div/div[1]/h6'
            ).text
            
            deadline = self.driver.find_element(
                By.XPATH, '//*[@id="container"]/div[2]/div[1]/div[2]/div/div[2]/div[2]/ul/li[5]/span[2]'
            ).text
            
            link = self.driver.find_element(
                By.XPATH, '//*[@id="container"]/div[2]/div[1]/div[2]/div/div[2]/div[2]/ul/li[8]/a'
            ).get_attribute("href")
            
            desc = self._get_description()
            classified = classify(title, desc)
            
            return {
                "title": title,
                "deadline": deadline,
                "url": link,
                "description": desc[:500],
                **classified,
            }
        except Exception as e:
            print(f"상세 파싱 오류: {e}")
            return {}

    def _get_description(self) -> str:
        try:
            return self.driver.find_element(By.CSS_SELECTOR, ".content").text
        except:
            return ""