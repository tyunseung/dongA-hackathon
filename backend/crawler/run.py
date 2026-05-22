from crawler.wevity_crawler import WevityCrawler
# from crawler.contestkorea_crawler import ContestKoreaCrawler
# ... 나머지 import

from db.database import SessionLocal
from db import models

def run_all():
    db = SessionLocal()
    crawlers = [WevityCrawler()]
    
    all_items = []
    for crawler in crawlers:
        try:
            items = crawler.crawl()
            all_items.extend(items)
        finally:
            crawler.quit()
    
    # 중복 제거 (URL 기준)
    existing_urls = {r.url for r in db.query(models.Activity.url).all()}
    new_items = [i for i in all_items if i["url"] not in existing_urls]
    
    for item in new_items:
        activity = models.CrawledActivity(**item)  # Activity → CrawledActivity
        db.add(activity)
    db.commit()
    print(f"신규 {len(new_items)}건 저장 완료")

if __name__ == "__main__":
    run_all()