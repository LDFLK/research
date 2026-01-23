from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

class PDFLoader:
    def __init__(self, pdf_path):
        self.pdf_path = pdf_path
    
    def load(self):
        loader = PyMuPDFLoader(self.pdf_path)
        content = loader.load()
        
        # Clean each document's text content
        cleaned_content = [
            Document(page_content=doc.page_content.replace("\n", " ").replace("\t"," ").replace("  "," "), metadata=doc.metadata)
            for doc in content
        ]

        print('document')
        print(cleaned_content)

        return cleaned_content
    
    def loadAmendment(self):
        loader = PyMuPDFLoader(self.pdf_path)
        pages = loader.load()  # returns list of Document objects, one per page

        merged_docs = []
        temp_content = ""
        temp_metadata = {}
        
        for i, page in enumerate(pages):
            temp_content += page.page_content + "\n"

            # Keep the metadata of the first page in the chunk
            if i % 3 == 0:
                temp_metadata = page.metadata

            # Every 3 pages or last page
            if (i + 1) % 3 == 0 or (i + 1) == len(pages):
                merged_docs.append(Document(page_content=temp_content.strip(), metadata=temp_metadata))
                temp_content = ""
                i -= 1

        print('merged docs')
        print(merged_docs)
        return merged_docs