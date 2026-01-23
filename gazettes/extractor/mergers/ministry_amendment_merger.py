def group_by_change_type(nested_data):

    flat_data = [item for sublist in nested_data for item in sublist]
    result = {
        "ADD": [],
        "OMIT": [],
        "RENUMBER": []
    }

    for item in flat_data:
        change_type = item.get("change_type")
        if change_type in result:
            result[change_type].append({
                "ministry_name": item.get("ministry_name"),
                "affected_column": item.get("affected_column"),
                "details": item.get("details", [])
            })

    return result