import Database from "better-sqlite3";
import { writeFileSync } from "fs";
import { resolve } from "path";

const DB_PATH = resolve(__dirname, "..", "app", "data", "slas.db");
const OUTPUT_PATH = resolve(__dirname, "..", "data", "institutions-pending-review.json");

interface InstitutionRow {
    id: string;
    name: string;
    kind_minor: string;
    latitude: number | null;
    longitude: number | null;
    location_name: string | null;
    district: string | null;
}

function main() {
    const db = new Database(DB_PATH, { readonly: true });

    const rows = db.prepare(`
    SELECT id, name, kind_minor, latitude, longitude, location_name, district
    FROM institutions
    ORDER BY id
  `).all() as InstitutionRow[];

    // Colombo coordinates (default)
    const COLOMBO_LAT = 6.9271;
    const COLOMBO_LNG = 79.8612;

    const pending = rows
        .filter((row) => {
            const isNull = row.latitude === null || row.longitude === null;
            // Use small epsilon for float comparison if needed, but exact match is likely fine here
            // since the default is set explicitly in code.
            const isDefault =
                Math.abs((row.latitude || 0) - COLOMBO_LAT) < 0.0001 &&
                Math.abs((row.longitude || 0) - COLOMBO_LNG) < 0.0001;

            return isNull || isDefault;
        })
        .map((row) => ({
            id: row.id,
            name: row.name,
            type: row.kind_minor || "",
            currentLat: row.latitude,
            currentLng: row.longitude,
            currentLocationName: row.location_name || "",
            currentDistrict: row.district || "",
            geocoded: row.latitude !== null,
        }));

    writeFileSync(OUTPUT_PATH, JSON.stringify(pending, null, 2));
    console.log(`Exported ${pending.length} pending institutions to ${OUTPUT_PATH}`);
}

main();
