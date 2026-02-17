import json
import time
import os
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError

import os
import sys

# Get the directory of the script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# Data directory is one level up
DATA_DIR = os.path.join(SCRIPT_DIR, "..", "data")

INPUT_FILE = os.path.join(DATA_DIR, "institutions-pending-review.json")
OUTPUT_FILE = os.path.join(DATA_DIR, "institutions-geocoded.json")

def get_geolocator():
    # User agent is required by Nominatim
    return Nominatim(user_agent="slas_institution_geocoder_v1")

import argparse
import re

def parse_args():
    parser = argparse.ArgumentParser(description="Geocode institutions from JSON file.")
    parser.add_argument("--sample", type=int, help="Run on a sample of N institutions", default=None)
    return parser.parse_args()

def clean_name(name):
    # Remove common prefixes/suffixes that confuse Nominatim
    name = re.sub(r"^Attached to the ", "", name, flags=re.IGNORECASE)
    name = re.sub(r"^[A-Za-z]+ Province\s*-\s*", "", name, flags=re.IGNORECASE)
    return name.strip()

def geocode_institution(geolocator, name, district=None):
    # original name query
    queries = [f"{name}, Sri Lanka"]
    
    # Cleaned name query
    cleaned = clean_name(name)
    if cleaned != name:
        queries.append(f"{cleaned}, Sri Lanka")
        
    # If district is available and not Colombo
    if district and district.lower() != "colombo":
        queries.append(f"{name}, {district}, Sri Lanka")
        if cleaned != name:
            queries.append(f"{cleaned}, {district}, Sri Lanka")
            
    for query in queries:
        try:
            print(f"    Trying query: {query}")
            location = geolocator.geocode(query, timeout=10)
            if location:
                return location.latitude, location.longitude, location.address
        except (GeocoderTimedOut, GeocoderServiceError) as e:
            print(f"    Error with query '{query}': {e}")
            # Continue to next query attempt
            
    return None, None, None

def main():
    args = parse_args()
    
    if not os.path.exists(INPUT_FILE):
        print(f"Input file not found: {INPUT_FILE}")
        return

    with open(INPUT_FILE, "r") as f:
        institutions = json.load(f)

    # Filter for those needing update (not geocoded or default Colombo)
    # The input file 'institutions-pending-review.json' is ALREADY filtered.
    
    geolocator = get_geolocator()
    updated_count = 0
    
    processed_data = []
    if os.path.exists(OUTPUT_FILE):
         with open(OUTPUT_FILE, "r") as f:
            processed_data = json.load(f)
            print(f"Loaded {len(processed_data)} already processed institutions.")
            
    processed_ids = {item["id"] for item in processed_data}

    # Apply sample limit if provided
    to_process = [i for i in institutions if i["id"] not in processed_ids]
    if args.sample:
        to_process = to_process[:args.sample]
        print(f"Running on sample of {args.sample} institutions.")

    print(f"Starting geocoding for {len(to_process)} institutions...")
    
    try:
        for i, inst in enumerate(to_process):
            print(f"[{i+1}/{len(to_process)}] Geocoding: {inst['name']}...")
            
            lat, lng, address = geocode_institution(geolocator, inst["name"], inst.get("currentDistrict"))
            
            if lat and lng:
                inst["currentLat"] = lat
                inst["currentLng"] = lng
                inst["currentLocationName"] = address
                inst["geocoded"] = True
                updated_count += 1
                print(f"  -> Found: {lat}, {lng} ({address})")
            else:
                print("  -> Not found")
            
            processed_data.append(inst)
            
            # Save progress every 10 items
            if len(processed_data) % 10 == 0:
                with open(OUTPUT_FILE, "w") as f:
                    json.dump(processed_data, f, indent=2)
            
            time.sleep(1.5)
            
    except KeyboardInterrupt:
        print("\nProcess interrupted. Saving progress...")
    finally:
        with open(OUTPUT_FILE, "w") as f:
            json.dump(processed_data, f, indent=2)
        print(f"Saved {len(processed_data)} institutions to {OUTPUT_FILE}")
        print(f"Updated coordinates for {updated_count} institutions.")

if __name__ == "__main__":
    main()
