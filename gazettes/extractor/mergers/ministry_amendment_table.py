import json

def merge_gazette_responses(response_list):
    merged = {
        "ministers": [],
        "changes": []
    }

    for res_str in response_list:
        try:
            # Allow both dict or string JSON input
            if isinstance(res_str, dict):
                data = res_str
            else:
                data = json.loads(res_str)

            if "ministers" in data and isinstance(data["ministers"], list):
                merged["ministers"].extend(data["ministers"])

            if "changes" in data and isinstance(data["changes"], list):
                merged["changes"].extend(data["changes"])

        except json.JSONDecodeError:
            print("Warning: Skipped invalid JSON chunk")
        except Exception as e:
            print(f"Unexpected error: {e}")

    return merged

import json

def merge_minister_responses(response_list):
    merged = {
        "ministers": []
    }

    for res_str in response_list:
        try:
            # If the item is already a dict, use it directly
            data = res_str if isinstance(res_str, dict) else json.loads(res_str)

            if "ministers" in data and isinstance(data["ministers"], list):
                merged["ministers"].extend(data["ministers"])

        except json.JSONDecodeError:
            print("Warning: Skipped invalid JSON chunk")
        except Exception as e:
            print(f"Unexpected error: {e}")

    

    return merged
