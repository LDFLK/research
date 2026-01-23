import json

# def merge_ministers(data):
#     merged = {}
#     for m in data.get("ministers", []):
#         name = m.get("name")
#         departments = m.get("departments", [])
#         if name:
#             if name not in merged:
#                 merged[name] = set(departments)
#             else:
#                 merged[name].update(departments)

#     return {
#         "ministers": [
#             {"name": name, "departments": sorted(depts)}
#             for name, depts in merged.items()
#         ]
#     }

# def merge_minister_responses(response_list):
#     merged = {
#         "ministers": []
#     }

#     for res_str in response_list:
#         try:
#             # If the item is already a Python dict, skip decoding
#             data = res_str if isinstance(res_str, dict) else json.loads(res_str)

#             if "ministers" in data and isinstance(data["ministers"], list):
#                 merged["ministers"].extend(data["ministers"])

#         except json.JSONDecodeError:
#             print("Warning: Skipped invalid JSON chunk")
#         except Exception as e:
#             print(f"Unexpected error: {e}")

#     return merged


def merge_ministers(data):
    merged = {}

    for m in data.get("ministers", []):
        name = m.get("name")
        subjects = m.get("subjects_and_functions", [])
        departments = m.get("departments", [])
        laws = m.get("laws_and_ordinances", [])

        if name:
            if name not in merged:
                merged[name] = {
                    "subjects_and_functions": set(subjects),
                    "departments": set(departments),
                    "laws_and_ordinances": set(laws)
                }
            else:
                merged[name]["subjects_and_functions"].update(subjects)
                merged[name]["departments"].update(departments)
                merged[name]["laws_and_ordinances"].update(laws)

    return {
        "ministers": [
            {
                "name": name,
                "subjects_and_functions": sorted(list(fields["subjects_and_functions"])),
                "departments": sorted(list(fields["departments"])),
                "laws_and_ordinances": sorted(list(fields["laws_and_ordinances"]))
            }
            for name, fields in merged.items()
        ]
    }

def merge_minister_responses(response_list):
    merged = {
        "ministers": []
    }

    for res_str in response_list:
        try:
            # If the item is already a Python dict, skip decoding
            data = res_str if isinstance(res_str, dict) else json.loads(res_str)

            if "ministers" in data and isinstance(data["ministers"], list):
                merged["ministers"].extend(data["ministers"])

        except json.JSONDecodeError:
            print("Warning: Skipped invalid JSON chunk")
        except Exception as e:
            print(f"Unexpected error: {e}")

    return merged

