import json

DATA_FILE = "../data/institutions-for-review.json"

def verify_counts():
    with open(DATA_FILE, "r") as f:
        institutions = json.load(f)

    colombo_coords = (6.9271, 79.8612)
    
    ministries_total = 0
    ministries_defaulted = 0
    total_defaulted = 0
    
    for inst in institutions:
        lat = inst.get("currentLat")
        lng = inst.get("currentLng")
        is_default = (lat == colombo_coords[0] and lng == colombo_coords[1])
        
        # Count total defaulted (including nulls as "pending" for this context?)
        # The user said "remaining 940 default-Colombo", implying specifically the default coords.
        if is_default:
            total_defaulted += 1
            
        # Check ministry type
        # "type" field in JSON comes from "kind_minor" in DB
        if inst.get("type") == "ministry":
            ministries_total += 1
            if is_default:
                ministries_defaulted += 1

    print(f"Total Ministries: {ministries_total}")
    print(f"Ministries defaulted to Colombo: {ministries_defaulted}")
    print(f"Total institutions defaulted to Colombo: {total_defaulted}")

if __name__ == "__main__":
    verify_counts()
