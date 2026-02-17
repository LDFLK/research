import Database from "better-sqlite3";
import { writeFileSync } from "fs";
import { join, resolve } from "path";

const DB_PATH = resolve(__dirname, "..", "app", "data", "slas.db");
const OUTPUT_PATH = resolve(__dirname, "..", "data", "institutions-for-review.json");

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

    const output = rows.map((row) => ({
        id: row.id,
        name: row.name,
        type: row.kind_minor || "",
        currentLat: row.latitude,
        currentLng: row.longitude,
        currentLocationName: row.location_name || "",
        currentDistrict: row.district || "",
        geocoded: row.latitude !== null,
    }));

    writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
    console.log(`Exported ${output.length} institutions to ${OUTPUT_PATH}`);
}

main();
