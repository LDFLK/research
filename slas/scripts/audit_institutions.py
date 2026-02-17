import json
import collections

DATA_FILE = "../data/institutions-for-review.json"

def audit():
    with open(DATA_FILE, "r") as f:
        institutions = json.load(f)

    total = len(institutions)
    not_geocoded = [i for i in institutions if not i.get("geocoded")]
    colombo_coords = (6.9271, 79.8612)
    
    suspicious_colombo = []
    
    for inst in institutions:
        lat = inst.get("currentLat")
        lng = inst.get("currentLng")
        
        if lat == colombo_coords[0] and lng == colombo_coords[1]:
            # It's geocoded to Colombo. Check if name suggests otherwise.
            name_lower = inst["name"].lower()
            if "colombo" not in name_lower and "western" not in name_lower and "ministry" not in name_lower and "department" not in name_lower and "commission" not in name_lower:
                 suspicious_colombo.append(inst)

    print(f"Total institutions: {total}")
    print(f"Not geocoded: {len(not_geocoded)}")
    print(f"Suspiciously geocoded to Colombo: {len(suspicious_colombo)}")
    
    print("\n--- Examples of Not Geocoded ---")
    for i in not_geocoded[:10]:
        print(f"{i['id']}: {i['name']}")

    print("\n--- Examples of Suspicious Colombo ---")
    for i in suspicious_colombo[:10]:
        print(f"{i['id']}: {i['name']}")

if __name__ == "__main__":
    audit()
