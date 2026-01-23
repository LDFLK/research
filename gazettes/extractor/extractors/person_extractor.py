from extractors.base_extractor import BaseExtractor
from prompts.person_prompts import INITIAL_PROMPT
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

class PersonExtractor(BaseExtractor):
    def __init__(self):
        self.llm = ChatOpenAI(temperature=0, max_tokens = 2048)
        
    def extract(self, documents):
        all_result = []
        
        prompt = PromptTemplate(input_variables=["docs"], template=INITIAL_PROMPT)
        chain = prompt | self.llm | StrOutputParser()
        
        for idx, page in enumerate(documents):
            print(f"Processing page {idx+1} (length: {len(page.page_content)})")

            if len(page.page_content) < 12000:
                try:
                    result = chain.invoke({"docs": page.page_content})
                    result = result.replace("\n","")
                    all_result.append(result)
                except Exception as e:
                    print(f"Error on page {idx+1}: {e}")
            else:
                print(f"Skipped page {idx+1} due to length.")

        return all_result