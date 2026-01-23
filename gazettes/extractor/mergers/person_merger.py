import json

def merge_person(response_list):
    merged = {
        "ADD": [],
        "TERMINATE": [],
        "RENAME": []
    }

    for res_str in response_list:
        try:
            if isinstance(res_str, dict):
                data = res_str
            else:
                data = json.loads(res_str)

            if "ADD" in data:
                merged["ADD"].extend(data["ADD"])
            if "TERMINATE" in data:
                merged["TERMINATE"].extend(data["TERMINATE"])
            if "RENAME" in data:
                merged["RENAME"].extend(data["RENAME"])

        except json.JSONDecodeError:
            print("Warning: Skipped invalid JSON chunk") 
        except Exception as e:
            print(f"Unexpected error: {e}")

    return merged
