#!/usr/bin/env npx tsx
/**
 * Fetch province & district boundary coordinates from gig-data GitHub repo,
 * convert to standard GeoJSON FeatureCollections, and write to public/geo/.
 *
 * Usage: cd slas/scripts && npx tsx build-geo.ts
 */

import { writeFileSync, mkdirSync } from "fs";
import { resolve, join } from "path";

const OUT_DIR = resolve(__dirname, "..", "app", "public", "geo");

const BASE_URL =
  "https://raw.githubusercontent.com/vibhatha/gig-data/0379a7a61614bac98e629bce03676020b8527cc4/geo";

// ── Static mappings ──────────────────────────────────────────────────────

interface ProvinceMeta {
  code: string;
  name: string;
}

interface DistrictMeta {
  code: string;
  name: string;
  provinceCode: string;
}

const PROVINCES: ProvinceMeta[] = [
  { code: "LK-1", name: "Western" },
  { code: "LK-2", name: "Central" },
  { code: "LK-3", name: "Southern" },
  { code: "LK-4", name: "Northern" },
  { code: "LK-5", name: "Eastern" },
  { code: "LK-6", name: "North Western" },
  { code: "LK-7", name: "North Central" },
  { code: "LK-8", name: "Uva" },
  { code: "LK-9", name: "Sabaragamuwa" },
];

const DISTRICTS: DistrictMeta[] = [
  { code: "LK-11", name: "Colombo", provinceCode: "LK-1" },
  { code: "LK-12", name: "Gampaha", provinceCode: "LK-1" },
  { code: "LK-13", name: "Kalutara", provinceCode: "LK-1" },
  { code: "LK-21", name: "Kandy", provinceCode: "LK-2" },
  { code: "LK-22", name: "Matale", provinceCode: "LK-2" },
  { code: "LK-23", name: "Nuwara Eliya", provinceCode: "LK-2" },
  { code: "LK-31", name: "Galle", provinceCode: "LK-3" },
  { code: "LK-32", name: "Matara", provinceCode: "LK-3" },
  { code: "LK-33", name: "Hambantota", provinceCode: "LK-3" },
  { code: "LK-41", name: "Jaffna", provinceCode: "LK-4" },
  { code: "LK-42", name: "Kilinochchi", provinceCode: "LK-4" },
  { code: "LK-43", name: "Mannar", provinceCode: "LK-4" },
  { code: "LK-44", name: "Vavuniya", provinceCode: "LK-4" },
  { code: "LK-45", name: "Mullaitivu", provinceCode: "LK-4" },
  { code: "LK-51", name: "Batticaloa", provinceCode: "LK-5" },
  { code: "LK-52", name: "Ampara", provinceCode: "LK-5" },
  { code: "LK-53", name: "Trincomalee", provinceCode: "LK-5" },
  { code: "LK-61", name: "Kurunegala", provinceCode: "LK-6" },
  { code: "LK-62", name: "Puttalam", provinceCode: "LK-6" },
  { code: "LK-71", name: "Anuradhapura", provinceCode: "LK-7" },
  { code: "LK-72", name: "Polonnaruwa", provinceCode: "LK-7" },
  { code: "LK-81", name: "Badulla", provinceCode: "LK-8" },
  { code: "LK-82", name: "Moneragala", provinceCode: "LK-8" },
  { code: "LK-91", name: "Ratnapura", provinceCode: "LK-9" },
  { code: "LK-92", name: "Kegalle", provinceCode: "LK-9" },
];

// ── Helpers ──────────────────────────────────────────────────────────────

type RawCoords = [number, number][][]; // [lng, lat][][]

async function fetchJson(url: string): Promise<RawCoords> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

/**
 * Convert raw [lng, lat][][] arrays into GeoJSON Polygon or MultiPolygon
 * geometry. Each sub-array is treated as a separate polygon ring.
 * If there's only one ring, produce a Polygon; otherwise a MultiPolygon.
 */
function toGeometry(
  raw: RawCoords
): GeoJSON.Polygon | GeoJSON.MultiPolygon {
  if (raw.length === 1) {
    return { type: "Polygon", coordinates: raw };
  }
  // Each ring becomes its own polygon in a MultiPolygon
  return {
    type: "MultiPolygon",
    coordinates: raw.map((ring) => [ring]),
  };
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  // Build provinces
  console.log("Fetching province boundaries...");
  const provinceFeatures: GeoJSON.Feature[] = [];
  for (const prov of PROVINCES) {
    const num = prov.code.replace("LK-", "");
    const url = `${BASE_URL}/province/LK-${num}.json`;
    console.log(`  ${prov.name} (${prov.code})...`);
    const raw = await fetchJson(url);
    provinceFeatures.push({
      type: "Feature",
      properties: { code: prov.code, name: prov.name },
      geometry: toGeometry(raw),
    });
  }

  const provincesFC: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: provinceFeatures,
  };
  const provPath = join(OUT_DIR, "provinces.geojson");
  writeFileSync(provPath, JSON.stringify(provincesFC));
  console.log(`Wrote ${provPath} (${provinceFeatures.length} features)`);

  // Build districts
  console.log("\nFetching district boundaries...");
  const districtFeatures: GeoJSON.Feature[] = [];
  for (const dist of DISTRICTS) {
    const num = dist.code.replace("LK-", "");
    const url = `${BASE_URL}/district/LK-${num}.json`;
    console.log(`  ${dist.name} (${dist.code})...`);
    const raw = await fetchJson(url);
    districtFeatures.push({
      type: "Feature",
      properties: {
        code: dist.code,
        name: dist.name,
        provinceCode: dist.provinceCode,
      },
      geometry: toGeometry(raw),
    });
  }

  const districtsFC: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: districtFeatures,
  };
  const distPath = join(OUT_DIR, "districts.geojson");
  writeFileSync(distPath, JSON.stringify(districtsFC));
  console.log(`Wrote ${distPath} (${districtFeatures.length} features)`);

  console.log("\nDone!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
