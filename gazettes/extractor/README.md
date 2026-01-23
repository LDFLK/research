
# LLM Based Gazette Extractor

This project is specific for Sri Lankan Gazette Data Extraction. Mainly for Ministry/Department extra ordinary gazettes, amendments and People gazettes that assign Ministers, State Ministers, Deputy Ministers and Secretaries to ministries.

## Features

- Minister/Department gazette data extraction
- Amendment gazette data extraction
- Person gazette data extraction

## How to Setup the project

#### Clone the repository
```http
  git clone https://github.com/ChanukaUOJ/LLM_Based_Gazette_Extractor.git
```
#### Create a virtual environment
```
  python -m venv <your_environment_name>
```
#### Run virtual environment (powershell)
```
  <your_environment_name>/Scripts/Activate.ps1
```
#### get dependencies
```http
  pip install -r requirements.txt
```
## How to Run?

#### Feed the terminal (powershell)
```http
  $env:OPENAI_API_key=<YOUR_API_KEY>
```
#### Run in terminal
```http
  python cli.py --type ministry-initial --pdf path_to_pdf --output output_directory

  --type   [ministry-inital, ministry-amendment, persons]
  --pdf  [path to the pdf]
  --output (optional)   [output directory] default /outputs
```






