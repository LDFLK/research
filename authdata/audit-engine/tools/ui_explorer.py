"""UI Explorer - Discover and map web application structure using Selenium."""

import time
import json
from typing import Optional
from dataclasses import dataclass, field, asdict
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


@dataclass
class PageElement:
    """Represents a discovered UI element."""
    tag: str
    text: str
    selector: str
    href: Optional[str] = None
    classes: list[str] = field(default_factory=list)
    element_type: str = "unknown"  # link, button, heading, input, table, etc.


@dataclass
class PageStructure:
    """Complete structure of a discovered page."""
    url: str
    title: str
    links: list[PageElement] = field(default_factory=list)
    buttons: list[PageElement] = field(default_factory=list)
    headings: list[PageElement] = field(default_factory=list)
    tables: list[dict] = field(default_factory=list)
    forms: list[PageElement] = field(default_factory=list)
    text_content: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "url": self.url,
            "title": self.title,
            "links": [asdict(l) for l in self.links],
            "buttons": [asdict(b) for b in self.buttons],
            "headings": [asdict(h) for h in self.headings],
            "tables": self.tables,
            "forms": [asdict(f) for f in self.forms],
            "text_content": self.text_content[:50]  # Limit for readability
        }


class UIExplorer:
    """Explore and discover web application UI structure."""

    def __init__(self, headless: bool = True):
        self.headless = headless
        self.driver: Optional[webdriver.Chrome] = None

    def start(self) -> None:
        """Start browser session."""
        options = webdriver.ChromeOptions()
        if self.headless:
            options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--window-size=1920,1080")
        self.driver = webdriver.Chrome(options=options)
        self.driver.implicitly_wait(10)

    def stop(self) -> None:
        """Stop browser session."""
        if self.driver:
            self.driver.quit()
            self.driver = None

    def explore_page(self, url: str, wait_time: int = 3) -> PageStructure:
        """Explore a page and return its structure."""
        self.driver.get(url)
        time.sleep(wait_time)

        structure = PageStructure(
            url=self.driver.current_url,
            title=self.driver.title
        )

        # Find links
        for el in self.driver.find_elements(By.TAG_NAME, "a"):
            text = el.text.strip()
            href = el.get_attribute("href")
            if text or href:
                structure.links.append(PageElement(
                    tag="a",
                    text=text[:100] if text else "",
                    selector=self._get_xpath(el),
                    href=href,
                    classes=el.get_attribute("class").split() if el.get_attribute("class") else [],
                    element_type="link"
                ))

        # Find buttons
        for el in self.driver.find_elements(By.TAG_NAME, "button"):
            text = el.text.strip() or el.get_attribute("aria-label") or ""
            if text:
                structure.buttons.append(PageElement(
                    tag="button",
                    text=text[:100],
                    selector=self._get_xpath(el),
                    classes=el.get_attribute("class").split() if el.get_attribute("class") else [],
                    element_type="button"
                ))

        # Find headings
        for tag in ["h1", "h2", "h3", "h4"]:
            for el in self.driver.find_elements(By.TAG_NAME, tag):
                text = el.text.strip()
                if text:
                    structure.headings.append(PageElement(
                        tag=tag,
                        text=text[:100],
                        selector=self._get_xpath(el),
                        element_type="heading"
                    ))

        # Find tables
        for i, table in enumerate(self.driver.find_elements(By.TAG_NAME, "table")):
            headers = [th.text for th in table.find_elements(By.TAG_NAME, "th")]
            rows = table.find_elements(By.TAG_NAME, "tr")
            structure.tables.append({
                "index": i,
                "headers": headers,
                "row_count": len(rows),
                "selector": f"//table[{i+1}]"
            })

        # Get text content (filtered)
        body_text = self.driver.find_element(By.TAG_NAME, "body").text
        lines = [l.strip() for l in body_text.split('\n') if l.strip() and len(l.strip()) > 2]
        structure.text_content = lines[:100]

        return structure

    def click_and_explore(self, url: str, click_selector: str, wait_time: int = 3) -> PageStructure:
        """Navigate to URL, click an element, then explore the resulting page."""
        self.driver.get(url)
        time.sleep(wait_time)

        element = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, click_selector))
        )
        element.click()
        time.sleep(wait_time)

        return self.explore_page(self.driver.current_url, wait_time=1)

    def find_elements_by_text(self, text: str, partial: bool = True) -> list[PageElement]:
        """Find all elements containing specific text."""
        results = []
        if partial:
            xpath = f"//*[contains(text(), '{text}')]"
        else:
            xpath = f"//*[text()='{text}']"

        for el in self.driver.find_elements(By.XPATH, xpath):
            results.append(PageElement(
                tag=el.tag_name,
                text=el.text.strip()[:100],
                selector=self._get_xpath(el),
                classes=el.get_attribute("class").split() if el.get_attribute("class") else [],
                element_type="text_match"
            ))
        return results

    def extract_table_data(self, table_selector: str = "//table") -> list[dict]:
        """Extract data from a table as list of dictionaries."""
        try:
            table = self.driver.find_element(By.XPATH, table_selector)
            headers = [th.text.strip() for th in table.find_elements(By.TAG_NAME, "th")]

            rows = []
            for tr in table.find_elements(By.TAG_NAME, "tr"):
                cells = tr.find_elements(By.TAG_NAME, "td")
                if cells:
                    if headers and len(cells) == len(headers):
                        rows.append({headers[i]: cells[i].text.strip() for i in range(len(headers))})
                    else:
                        rows.append({"cells": [c.text.strip() for c in cells]})
            return rows
        except Exception as e:
            return [{"error": str(e)}]

    def take_screenshot(self, path: str) -> bool:
        """Save screenshot of current page."""
        if self.driver:
            return self.driver.save_screenshot(path)
        return False

    def _get_xpath(self, element) -> str:
        """Generate a simple XPath for an element."""
        tag = element.tag_name
        text = element.text.strip()[:30] if element.text else ""

        if text:
            return f"//{tag}[contains(text(), '{text}')]"

        el_id = element.get_attribute("id")
        if el_id:
            return f"//{tag}[@id='{el_id}']"

        classes = element.get_attribute("class")
        if classes:
            first_class = classes.split()[0]
            return f"//{tag}[contains(@class, '{first_class}')]"

        return f"//{tag}"

    def navigate_to_dataset(
        self,
        base_url: str,
        category: str,
        dataset_name: str,
        wait_time: int = 3
    ) -> dict:
        """Navigate to a specific dataset and return its data."""
        self.driver.get(base_url)
        time.sleep(wait_time)

        result = {
            "success": False,
            "navigation_steps": [],
            "data": None,
            "error": None
        }

        try:
            # Click category
            cat_el = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, f"//*[text()='{category}']"))
            )
            cat_el.click()
            result["navigation_steps"].append(f"Clicked category: {category}")
            time.sleep(2)

            # Click dataset
            dataset_el = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, f"//*[contains(text(), '{dataset_name}')]"))
            )
            dataset_el.click()
            result["navigation_steps"].append(f"Clicked dataset: {dataset_name}")
            time.sleep(2)

            # Try to click on dataset card if exists
            try:
                card = self.driver.find_element(By.XPATH, f"//p[contains(text(), '{dataset_name}')]")
                card.click()
                result["navigation_steps"].append("Clicked dataset card")
                time.sleep(3)
            except:
                pass

            # Wait for and extract table data
            WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.TAG_NAME, "table"))
            )
            result["navigation_steps"].append("Found data table")

            result["data"] = self.extract_table_data()
            result["success"] = True

        except Exception as e:
            result["error"] = str(e)

        return result

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.stop()
        return False
