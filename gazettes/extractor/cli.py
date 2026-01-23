import argparse
from yaspin import yaspin

from main import run_pipeline

def main():
    parser = argparse.ArgumentParser(description="Gazette PDF Extractor CLI")
    parser.add_argument('--type', required=True, choices=['ministry-initial','ministry-amendment','ministry-amendment-table','persons'], help="Type of gazette to process")
    parser.add_argument('--pdf', required=True, help="Input PDF file path")
    parser.add_argument('--output', required=False, default='outputs/', help="Path to save the JSON output")
    
    args = parser.parse_args()

    with yaspin(text="Processing Gazette PDF...", color="cyan") as spinner:
        try:
            run_pipeline(gazette_type=args.type, pdf_path=args.pdf, output_path=args.output)
            spinner.ok("✅")
        except Exception as e:
            spinner.fail("❌")
            print(f"Error: {e}")
            
if __name__ == "__main__":
    main()