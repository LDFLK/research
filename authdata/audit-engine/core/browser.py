"""Selenium browser wrapper with full action logging."""

import time
from typing import Optional, List
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.remote.webelement import WebElement
from selenium.common.exceptions import (
    TimeoutException,
    NoSuchElementException,
    WebDriverException
)

from .logger import ActionLogger, Target, Extraction


class LoggedBrowser:
    """Selenium browser wrapper that logs all actions."""

    def __init__(self, logger: ActionLogger, phase: str, headless: bool = True):
        self.logger = logger
        self.phase = phase
        self.headless = headless
        self.driver: Optional[webdriver.Chrome] = None

    def start(self) -> None:
        """Start the browser session."""
        options = webdriver.ChromeOptions()
        if self.headless:
            options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--window-size=1920,1080")

        self.driver = webdriver.Chrome(options=options)
        self.driver.implicitly_wait(10)

    def stop(self) -> None:
        """Stop the browser session."""
        if self.driver:
            self.driver.quit()
            self.driver = None

    def navigate(self, url: str) -> tuple[bool, Optional[str]]:
        """Navigate to a URL and log the action."""
        start_time = time.time()
        target = Target(url=url)

        try:
            self.driver.get(url)
            duration_ms = int((time.time() - start_time) * 1000)

            self.logger.log_action(
                phase=self.phase,
                action_type="selenium_navigate",
                target=target,
                duration_ms=duration_ms,
                status="success",
                metadata={"page_title": self.driver.title}
            )
            return True, None

        except WebDriverException as e:
            duration_ms = int((time.time() - start_time) * 1000)
            error_msg = str(e)

            self.logger.log_action(
                phase=self.phase,
                action_type="selenium_navigate",
                target=target,
                duration_ms=duration_ms,
                status="failure",
                error=error_msg
            )
            return False, error_msg

    def click(self, selector: str, by: By = By.XPATH, timeout: int = 10) -> tuple[bool, Optional[str]]:
        """Click an element and log the action."""
        start_time = time.time()
        target = Target(selector=selector, url=self.driver.current_url)

        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.element_to_be_clickable((by, selector))
            )
            element.click()
            duration_ms = int((time.time() - start_time) * 1000)

            self.logger.log_action(
                phase=self.phase,
                action_type="selenium_click",
                target=target,
                duration_ms=duration_ms,
                status="success"
            )
            return True, None

        except (TimeoutException, NoSuchElementException) as e:
            duration_ms = int((time.time() - start_time) * 1000)
            error_msg = f"Element not found or not clickable: {selector}"

            self.logger.log_action(
                phase=self.phase,
                action_type="selenium_click",
                target=target,
                duration_ms=duration_ms,
                status="failure",
                error=error_msg
            )
            return False, error_msg

    def wait_for_element(
        self,
        selector: str,
        by: By = By.XPATH,
        timeout: int = 10
    ) -> tuple[bool, Optional[str]]:
        """Wait for an element to be present and log the action."""
        start_time = time.time()
        target = Target(selector=selector, url=self.driver.current_url)

        try:
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, selector))
            )
            duration_ms = int((time.time() - start_time) * 1000)

            self.logger.log_action(
                phase=self.phase,
                action_type="selenium_wait",
                target=target,
                duration_ms=duration_ms,
                status="success"
            )
            return True, None

        except TimeoutException:
            duration_ms = int((time.time() - start_time) * 1000)
            error_msg = f"Timeout waiting for element: {selector}"

            self.logger.log_action(
                phase=self.phase,
                action_type="selenium_wait",
                target=target,
                duration_ms=duration_ms,
                status="failure",
                error=error_msg
            )
            return False, error_msg

    def extract_text(
        self,
        selector: str,
        by: By = By.XPATH,
        timeout: int = 10
    ) -> tuple[Optional[str], Optional[str]]:
        """Extract text from an element and log the action."""
        start_time = time.time()
        target = Target(selector=selector, url=self.driver.current_url)

        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, selector))
            )
            text = element.text
            duration_ms = int((time.time() - start_time) * 1000)

            extraction = Extraction(
                method="xpath" if by == By.XPATH else "css_selector",
                query=selector,
                result=text,
                found=bool(text)
            )

            self.logger.log_action(
                phase=self.phase,
                action_type="selenium_extract",
                target=target,
                extraction=extraction,
                duration_ms=duration_ms,
                status="success"
            )
            return text, None

        except (TimeoutException, NoSuchElementException) as e:
            duration_ms = int((time.time() - start_time) * 1000)
            error_msg = f"Failed to extract text from: {selector}"

            extraction = Extraction(
                method="xpath" if by == By.XPATH else "css_selector",
                query=selector,
                result=None,
                found=False
            )

            self.logger.log_action(
                phase=self.phase,
                action_type="selenium_extract",
                target=target,
                extraction=extraction,
                duration_ms=duration_ms,
                status="failure",
                error=error_msg
            )
            return None, error_msg

    def extract_elements(
        self,
        selector: str,
        by: By = By.XPATH,
        timeout: int = 10
    ) -> tuple[List[WebElement], Optional[str]]:
        """Extract multiple elements and log the action."""
        start_time = time.time()
        target = Target(selector=selector, url=self.driver.current_url)

        try:
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, selector))
            )
            elements = self.driver.find_elements(by, selector)
            texts = [el.text for el in elements[:10]]  # Limit to first 10 for logging
            duration_ms = int((time.time() - start_time) * 1000)

            extraction = Extraction(
                method="element_list",
                query=selector,
                result=texts,
                found=len(elements) > 0
            )

            self.logger.log_action(
                phase=self.phase,
                action_type="selenium_extract",
                target=target,
                extraction=extraction,
                duration_ms=duration_ms,
                status="success",
                metadata={"element_count": len(elements)}
            )
            return elements, None

        except TimeoutException:
            duration_ms = int((time.time() - start_time) * 1000)
            error_msg = f"No elements found for: {selector}"

            extraction = Extraction(
                method="element_list",
                query=selector,
                result=[],
                found=False
            )

            self.logger.log_action(
                phase=self.phase,
                action_type="selenium_extract",
                target=target,
                extraction=extraction,
                duration_ms=duration_ms,
                status="failure",
                error=error_msg
            )
            return [], error_msg

    def get_page_source(self) -> str:
        """Get the current page source."""
        return self.driver.page_source if self.driver else ""

    def get_current_url(self) -> str:
        """Get the current URL."""
        return self.driver.current_url if self.driver else ""

    def take_screenshot(self, path: str) -> bool:
        """Take a screenshot and save to path."""
        if self.driver:
            return self.driver.save_screenshot(path)
        return False

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.stop()
        return False
