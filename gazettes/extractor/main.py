import json
from pathlib import Path

from extractors.ministry_amendment_and_table_extractor import MinistryAmendmentTableExtractor
from extractors.ministry_amendment_extractor import MinistryAmendmentExtractor
from extractors.ministry_extractor import MinistryExtractor
from extractors.person_extractor import PersonExtractor
from loaders.pdf_loader import PDFLoader
from mergers.ministry_amendment_merger import group_by_change_type
from mergers.ministry_amendment_table import merge_gazette_responses
from mergers.ministry_merger import merge_ministers
from mergers.person_merger import merge_person

def run_pipeline(gazette_type: str, pdf_path: str, output_path: str):
    documents = PDFLoader(pdf_path).load()

    if not output_path:
        output_path = "outputs/"

    pdf_path = Path(pdf_path)
    pdf_name = pdf_path.name.split('.')[0]

    final_result = {}
    
    if gazette_type == "ministry-initial":
        extractor = MinistryExtractor()
        raw_result = extractor.extract(documents)
        final_result = merge_ministers(raw_result)

    elif gazette_type == "ministry-amendment":
        ad = PDFLoader(pdf_path).loadAmendment()
        extractor = MinistryAmendmentExtractor()
        raw_result = extractor.extract(ad)
        final_result = group_by_change_type(raw_result)

    elif gazette_type == "ministry-amendment-table":
        extractor = MinistryAmendmentTableExtractor()
        raw_result = extractor.extract(documents)
        # final_result = merge_gazette_responses(raw_result)
    
    elif gazette_type == "persons":
        extractor = PersonExtractor()
        raw_result = extractor.extract(documents)
        final_result = merge_person(raw_result)
    
    if final_result is not {}:
        with open(f'{output_path}{gazette_type}-{pdf_name}.json',"w", encoding="utf-8") as f:
            json.dump(final_result, f, indent=2, ensure_ascii=False)  
