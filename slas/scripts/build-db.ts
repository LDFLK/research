#!/usr/bin/env npx tsx
/**
 * Build SQLite database from yearly SLAS seniority list JSON files.
 *
 * Reads all slas/data/YYYY_*.json files, resolves officer identities by
 * fileNumber, normalizes posts using the classification taxonomy, and
 * outputs slas/app/data/slas.db.
 *
 * Usage: cd slas/scripts && npx tsx build-db.ts
 */

import Database from "better-sqlite3";
import { readFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join, resolve } from "path";

// ── Paths ───────────────────────────────────────────────────────────────

const DATA_DIR = resolve(__dirname, "..", "data");
const DB_DIR = resolve(__dirname, "..", "app", "data");
const DB_PATH = join(DB_DIR, "slas.db");

// ── Types ───────────────────────────────────────────────────────────────

interface RawOfficer {
  serialNo: number;
  currentSeniorityNo: number;
  fileNumber: string;
  name: string;
  presentPost: string;
  presentWorkPlace: string;
  dateOfBirth?: string;
  dateOfEntryToGradeIII?: string;
  dateOfPromotionToGradeII?: string;
  dateOfPromotionToGradeI?: string;
  dateOfPromotionToGradeSP?: string;
}

interface SeniorityFile {
  title: string;
  asAt: string;
  grade: string;
  officers: RawOfficer[];
}

interface PostClassification {
  id: string;
  normalizedTitle: string;
  kind: { major: string; minor: string };
  rawVariants: string[];
}

interface PostCatalog {
  posts: PostClassification[];
}

type GradeShort = "SP" | "GI" | "GII" | "GIII";

interface LocationEntry {
  lat: number;
  lng: number;
  district: string;
}

interface InstitutionOverride {
  lat: number;
  lng: number;
  location: string;
}

interface CoordinateData {
  defaultLatLng: [number, number];
  locations: Record<string, LocationEntry>;
  institutionOverrides: Record<string, InstitutionOverride>;
}

interface GeocodedInstitution {
  id: string;
  name: string;
  type: string;
  officerCount: number;
  status: "verified" | "default_colombo" | "missing";
  currentLat: number | null;
  currentLng: number | null;
  currentLocationName: string;
  currentDistrict: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────

const GRADE_MAP: Record<string, GradeShort> = {
  "Special Grade": "SP",
  "Grade I": "GI",
  "Grade II": "GII",
  "Grade III": "GIII",
};

function parseDate(raw: string | undefined): string {
  if (!raw) return "";
  const s = raw.trim();
  if (!s) return "";
  // M/D/YYYY → YYYY-MM-DD
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const month = m[1].padStart(2, "0");
    const day = m[2].padStart(2, "0");
    return `${m[3]}-${month}-${day}`;
  }
  // Already ISO?
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);
  return s;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Post normalization ──────────────────────────────────────────────────

function buildPostLookup(catalog: PostCatalog) {
  // Map lowercase raw variant → classification
  const lookup = new Map<string, PostClassification>();
  for (const post of catalog.posts) {
    for (const variant of post.rawVariants) {
      lookup.set(variant.toLowerCase().trim(), post);
    }
  }
  return lookup;
}

function normalizePost(
  raw: string,
  lookup: Map<string, PostClassification>
): { normalizedTitle: string; major: string; minor: string } {
  if (!raw) return { normalizedTitle: "", major: "", minor: "" };

  const trimmed = raw.trim();
  const lc = trimmed.toLowerCase();

  // Exact match
  const exact = lookup.get(lc);
  if (exact) {
    return {
      normalizedTitle: exact.normalizedTitle,
      major: exact.kind.major,
      minor: exact.kind.minor,
    };
  }

  // Partial match: try progressively shorter prefixes
  for (const [variant, post] of lookup) {
    if (lc.startsWith(variant) || variant.startsWith(lc)) {
      return {
        normalizedTitle: post.normalizedTitle,
        major: post.kind.major,
        minor: post.kind.minor,
      };
    }
  }

  // No match — return raw
  return { normalizedTitle: trimmed, major: "", minor: "" };
}

// ── Institution normalization ───────────────────────────────────────────

function normalizeInstitution(raw: string): {
  name: string;
  id: string;
  kindMinor: string;
} {
  if (!raw) return { name: "", id: "", kindMinor: "" };

  let name = raw
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*/g, " - ");

  // Detect institution type
  let kindMinor = "";
  const lc = name.toLowerCase();
  if (lc.includes("ministry") || lc.includes("chief ministry")) {
    kindMinor = "ministry";
  } else if (lc.includes("department")) {
    kindMinor = "department";
  } else if (lc.includes("divisional secretariat")) {
    kindMinor = "divisional-secretariat";
  } else if (lc.includes("district secretariat")) {
    kindMinor = "district-secretariat";
  } else if (
    lc.includes("provincial council") ||
    lc.includes("provincial public service") ||
    lc.includes("chief secretary")
  ) {
    kindMinor = "provincial";
  } else if (
    lc.includes("municipal") ||
    lc.includes("urban council") ||
    lc.includes("pradeshiya sabha")
  ) {
    kindMinor = "municipal";
  } else if (lc.includes("commission")) {
    kindMinor = "commission";
  } else if (lc.includes("authority") || lc.includes("board")) {
    kindMinor = "statutory-body";
  } else if (lc.includes("secretariat") || lc.includes("office")) {
    kindMinor = "secretariat";
  }

  const id = slugify(name);
  return { name, id, kindMinor };
}

// ── Geocoding ───────────────────────────────────────────────────────────

function geocodeInstitution(
  instId: string,
  instName: string,
  kindMinor: string,
  coords: CoordinateData,
  geocodedLookup: Map<string, GeocodedInstitution>
): { lat: number | null; lng: number | null; locationName: string; district: string } {
  // 0. Check master geocoded file first (single source of truth)
  const geocoded = geocodedLookup.get(instId);
  if (geocoded && geocoded.status === "verified" && geocoded.currentLat != null) {
    return {
      lat: geocoded.currentLat,
      lng: geocoded.currentLng!,
      locationName: geocoded.currentLocationName,
      district: geocoded.currentDistrict,
    };
  }

  // 1. Check explicit overrides — exact match first, then fuzzy
  if (coords.institutionOverrides[instId]) {
    const ov = coords.institutionOverrides[instId];
    const district = findDistrictForLocation(ov.location, coords);
    return { lat: ov.lat, lng: ov.lng, locationName: ov.location, district };
  }
  // Fuzzy override: find best matching override key (handles slug variants
  // like "department-of-immigration-emigration" vs "department-of-immigration-and-emigration")
  const overrideKeys = Object.keys(coords.institutionOverrides);
  for (const oKey of overrideKeys) {
    if (instId.includes(oKey) || oKey.includes(instId)) {
      const ov = coords.institutionOverrides[oKey];
      const district = findDistrictForLocation(ov.location, coords);
      return { lat: ov.lat, lng: ov.lng, locationName: ov.location, district };
    }
  }

  const lc = instName.toLowerCase();

  // 2. Extract location from "Divisional Secretariat, X" or "Divisional Secretariat - X"
  //    Also handles "Divisional Secretary,Divisional Secretariat, X"
  const dsMatch = lc.match(
    /(?:divisional secretariat|district secretariat)[,\s\-–]+(?:.*secretariat[,\s\-–]+)?(.+)/
  );
  if (dsMatch) {
    let place = dsMatch[1].trim();
    // Strip trailing sub-location after comma (e.g. "Koralepaththu west, Oddamavady")
    if (place.includes(",")) {
      place = place.split(",")[0].trim();
    }
    const loc = coords.locations[place];
    if (loc) {
      return { lat: loc.lat, lng: loc.lng, locationName: place, district: loc.district };
    }
    // Try without non-alpha chars
    const normalized = place.replace(/[^a-z ]/g, "").trim();
    const loc2 = coords.locations[normalized];
    if (loc2) {
      return { lat: loc2.lat, lng: loc2.lng, locationName: normalized, district: loc2.district };
    }
    // Fuzzy: find closest key that starts with or is contained in place
    for (const key of Object.keys(coords.locations)) {
      if (place.startsWith(key) || key.startsWith(place)) {
        const loc3 = coords.locations[key];
        return { lat: loc3.lat, lng: loc3.lng, locationName: key, district: loc3.district };
      }
    }
  }

  let provMatch = lc.match(
    /(?:provinc(?:e|ial)|chief secretary|council secretariat)(?:['’]?s)?(?: office)?(?:[\s\-–,]+)(.+)/
  );

  // If no match, try reversed: "Central Province - Chief Secretary Office"
  if (!provMatch) {
    const reverseMatch = lc.match(
      /(.+)[\s\-–,]+(?:provinc(?:e|ial)|chief secretary|council secretariat)(?:['’]?s)?(?: office)?/
    );
    if (reverseMatch) {
      provMatch = reverseMatch;
    }
  }
  if (provMatch) {
    let province = provMatch[1].trim();
    // Clean up known suffixes/prefixes from the captured group
    province = province
      .replace(
        /(?:-|–|,|provinc(?:e|ial)|council|ministry|department|chief|secretary|office|board|authority)/g,
        ""
      )
      .trim();

    // Map province to capital city (handling typos)
    // Keys include common typos found in data
    const provinceCaps: Record<string, string> = {
      western: "colombo",
      central: "kandy",
      cenntral: "kandy",
      southern: "galle",
      sourthen: "galle",
      northern: "jaffna",
      northen: "jaffna",
      "north western": "kurunegala",
      wayamba: "kurunegala",
      "north central": "anuradhapura",
      uva: "badulla",
      sabaragamuwa: "ratnapura",
      eastern: "trincomalee",
    };

    // Check exact match or if province string contains key
    let capCity = "";
    for (const [key, city] of Object.entries(provinceCaps)) {
      if (province.includes(key)) {
        capCity = city;
        break;
      }
    }

    if (capCity && coords.locations[capCity]) {
      const loc = coords.locations[capCity];
      return {
        lat: loc.lat,
        lng: loc.lng,
        locationName: capCity,
        district: loc.district,
      };
    }
  }

  // 4. Try to find any location name embedded in institution name
  // Sort by longest key first to match more specific names first
  const sortedKeys = Object.keys(coords.locations).sort(
    (a, b) => b.length - a.length
  );
  for (const key of sortedKeys) {
    // Only match if key appears as a word boundary in the name
    const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
    if (regex.test(lc)) {
      const loc = coords.locations[key];
      return { lat: loc.lat, lng: loc.lng, locationName: key, district: loc.district };
    }
  }

  // 5. Default: ministries, departments, commissions, provincial → Colombo
  if (
    kindMinor === "ministry" ||
    kindMinor === "department" ||
    kindMinor === "commission" ||
    kindMinor === "secretariat" ||
    kindMinor === "statutory-body" ||
    kindMinor === "provincial"
  ) {
    return {
      lat: coords.defaultLatLng[0],
      lng: coords.defaultLatLng[1],
      locationName: "Colombo",
      district: "Colombo",
    };
  }

  return { lat: null, lng: null, locationName: "", district: "" };
}

function findDistrictForLocation(locationName: string, coords: CoordinateData): string {
  const lc = locationName.toLowerCase();
  const loc = coords.locations[lc];
  if (loc) return loc.district;
  // Try to find a matching key
  for (const [key, entry] of Object.entries(coords.locations)) {
    if (key.toLowerCase() === lc) return entry.district;
  }
  return "Colombo";
}

// ── Database schema ─────────────────────────────────────────────────────

function createSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS officers (
      file_number TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      date_of_birth TEXT,
      date_of_entry_grade_iii TEXT,
      date_of_promotion_grade_ii TEXT,
      date_of_promotion_grade_i TEXT,
      date_of_promotion_grade_sp TEXT,
      first_seen_year INTEGER,
      last_seen_year INTEGER,
      current_grade TEXT,
      current_post TEXT,
      current_workplace TEXT
    );

    CREATE TABLE IF NOT EXISTS snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_number TEXT NOT NULL,
      year INTEGER NOT NULL,
      grade TEXT NOT NULL,
      seniority_no INTEGER,
      raw_post TEXT,
      normalized_post TEXT,
      post_kind_major TEXT,
      post_kind_minor TEXT,
      workplace TEXT,
      normalized_institution TEXT,
      institution_id TEXT,
      FOREIGN KEY (file_number) REFERENCES officers(file_number),
      UNIQUE(file_number, year)
    );

    CREATE TABLE IF NOT EXISTS institutions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      kind_major TEXT DEFAULT 'Organisation',
      kind_minor TEXT,
      latitude REAL,
      longitude REAL,
      location_name TEXT,
      district TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_snapshots_file_number ON snapshots(file_number);
    CREATE INDEX IF NOT EXISTS idx_snapshots_year ON snapshots(year);
    CREATE INDEX IF NOT EXISTS idx_snapshots_institution ON snapshots(institution_id);
    CREATE INDEX IF NOT EXISTS idx_snapshots_grade ON snapshots(grade);
    CREATE INDEX IF NOT EXISTS idx_snapshots_post ON snapshots(normalized_post);
  `);
}

// ── Main build ──────────────────────────────────────────────────────────

function main() {
  console.log("=== SLAS Database Builder ===\n");

  // Load post classification
  const catalogPath = join(DATA_DIR, "slas-post-classification.json");
  const catalog: PostCatalog = JSON.parse(readFileSync(catalogPath, "utf-8"));
  const postLookup = buildPostLookup(catalog);
  console.log(`Loaded ${catalog.posts.length} post classifications`);

  // Load institution coordinates
  const coordsPath = join(DATA_DIR, "institution-coordinates.json");
  const coords: CoordinateData = JSON.parse(readFileSync(coordsPath, "utf-8"));
  console.log(
    `Loaded ${Object.keys(coords.locations).length} locations, ${Object.keys(coords.institutionOverrides).length} overrides`
  );

  // Load master geocoded institutions file
  const geocodedPath = join(DATA_DIR, "institutions-geocoded.json");
  const geocodedLookup = new Map<string, GeocodedInstitution>();
  if (existsSync(geocodedPath)) {
    const geocodedList: GeocodedInstitution[] = JSON.parse(readFileSync(geocodedPath, "utf-8"));
    for (const entry of geocodedList) {
      geocodedLookup.set(entry.id, entry);
    }
    console.log(`Loaded ${geocodedLookup.size} geocoded institutions from master file`);
  }

  // Find all yearly JSON files
  const jsonFiles = readdirSync(DATA_DIR)
    .filter((f) => /^\d{4}_(sp_grade|grade_i{1,3})\.json$/.test(f))
    .sort();
  console.log(`Found ${jsonFiles.length} data files\n`);

  // Create output directory and database
  mkdirSync(DB_DIR, { recursive: true });
  if (existsSync(DB_PATH)) {
    // Remove old DB
    require("fs").unlinkSync(DB_PATH);
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  createSchema(db);

  // Prepare statements
  const upsertOfficer = db.prepare(`
    INSERT INTO officers (
      file_number, name, date_of_birth,
      date_of_entry_grade_iii, date_of_promotion_grade_ii,
      date_of_promotion_grade_i, date_of_promotion_grade_sp,
      first_seen_year, last_seen_year,
      current_grade, current_post, current_workplace
    ) VALUES (
      @file_number, @name, @date_of_birth,
      @date_of_entry_grade_iii, @date_of_promotion_grade_ii,
      @date_of_promotion_grade_i, @date_of_promotion_grade_sp,
      @first_seen_year, @last_seen_year,
      @current_grade, @current_post, @current_workplace
    )
    ON CONFLICT(file_number) DO UPDATE SET
      name = CASE WHEN @last_seen_year >= last_seen_year THEN @name ELSE name END,
      date_of_birth = COALESCE(NULLIF(@date_of_birth, ''), date_of_birth),
      date_of_entry_grade_iii = COALESCE(NULLIF(@date_of_entry_grade_iii, ''), date_of_entry_grade_iii),
      date_of_promotion_grade_ii = COALESCE(NULLIF(@date_of_promotion_grade_ii, ''), date_of_promotion_grade_ii),
      date_of_promotion_grade_i = COALESCE(NULLIF(@date_of_promotion_grade_i, ''), date_of_promotion_grade_i),
      date_of_promotion_grade_sp = COALESCE(NULLIF(@date_of_promotion_grade_sp, ''), date_of_promotion_grade_sp),
      first_seen_year = MIN(first_seen_year, @first_seen_year),
      last_seen_year = MAX(last_seen_year, @last_seen_year),
      current_grade = CASE WHEN @last_seen_year >= last_seen_year THEN @current_grade ELSE current_grade END,
      current_post = CASE WHEN @last_seen_year >= last_seen_year THEN @current_post ELSE current_post END,
      current_workplace = CASE WHEN @last_seen_year >= last_seen_year THEN @current_workplace ELSE current_workplace END
  `);

  const insertSnapshot = db.prepare(`
    INSERT OR REPLACE INTO snapshots (
      file_number, year, grade, seniority_no,
      raw_post, normalized_post, post_kind_major, post_kind_minor,
      workplace, normalized_institution, institution_id
    ) VALUES (
      @file_number, @year, @grade, @seniority_no,
      @raw_post, @normalized_post, @post_kind_major, @post_kind_minor,
      @workplace, @normalized_institution, @institution_id
    )
  `);

  const upsertInstitution = db.prepare(`
    INSERT OR IGNORE INTO institutions (id, name, kind_major, kind_minor, latitude, longitude, location_name, district)
    VALUES (@id, @name, @kind_major, @kind_minor, @latitude, @longitude, @location_name, @district)
  `);

  // Process all files in a transaction
  let totalSnapshots = 0;
  const institutionsSeen = new Set<string>();

  const processAll = db.transaction(() => {
    for (const file of jsonFiles) {
      const filePath = join(DATA_DIR, file);
      const data: SeniorityFile = JSON.parse(readFileSync(filePath, "utf-8"));

      // Extract year from filename
      const yearMatch = file.match(/^(\d{4})_/);
      if (!yearMatch) continue;
      const year = parseInt(yearMatch[1]);

      const gradeShort = GRADE_MAP[data.grade];
      if (!gradeShort) {
        console.warn(`  Unknown grade: ${data.grade} in ${file}`);
        continue;
      }

      let fileSnapshots = 0;

      for (const officer of data.officers) {
        const fn = officer.fileNumber;
        if (!fn || !(fn.startsWith("75/10/") || fn.startsWith("SLAS/"))) continue;

        // Normalize post
        const postNorm = normalizePost(officer.presentPost, postLookup);

        // Normalize institution
        const inst = normalizeInstitution(officer.presentWorkPlace);

        // Upsert officer
        upsertOfficer.run({
          file_number: fn,
          name: officer.name || "",
          date_of_birth: parseDate(officer.dateOfBirth),
          date_of_entry_grade_iii: parseDate(officer.dateOfEntryToGradeIII),
          date_of_promotion_grade_ii: parseDate(
            officer.dateOfPromotionToGradeII
          ),
          date_of_promotion_grade_i: parseDate(officer.dateOfPromotionToGradeI),
          date_of_promotion_grade_sp: parseDate(
            officer.dateOfPromotionToGradeSP
          ),
          first_seen_year: year,
          last_seen_year: year,
          current_grade: gradeShort,
          current_post: postNorm.normalizedTitle,
          current_workplace: inst.name,
        });

        // Insert snapshot
        insertSnapshot.run({
          file_number: fn,
          year,
          grade: gradeShort,
          seniority_no: officer.currentSeniorityNo,
          raw_post: officer.presentPost,
          normalized_post: postNorm.normalizedTitle,
          post_kind_major: postNorm.major,
          post_kind_minor: postNorm.minor,
          workplace: officer.presentWorkPlace,
          normalized_institution: inst.name,
          institution_id: inst.id || null,
        });

        // Track institution
        if (inst.id && !institutionsSeen.has(inst.id)) {
          institutionsSeen.add(inst.id);
          const geo = geocodeInstitution(inst.id, inst.name, inst.kindMinor, coords, geocodedLookup);
          upsertInstitution.run({
            id: inst.id,
            name: inst.name,
            kind_major: "Organisation",
            kind_minor: inst.kindMinor,
            latitude: geo.lat,
            longitude: geo.lng,
            location_name: geo.locationName,
            district: geo.district || null,
          });
        }

        fileSnapshots++;
      }

      totalSnapshots += fileSnapshots;
      console.log(
        `  ${file}: ${fileSnapshots} officers (${gradeShort}, ${year})`
      );
    }
  });

  processAll();

  // Summary stats
  const officerCount = (
    db.prepare("SELECT COUNT(*) as c FROM officers").get() as any
  ).c;
  const snapshotCount = (
    db.prepare("SELECT COUNT(*) as c FROM snapshots").get() as any
  ).c;
  const instCount = (
    db.prepare("SELECT COUNT(*) as c FROM institutions").get() as any
  ).c;

  const geocodedCount = (
    db
      .prepare(
        "SELECT COUNT(*) as c FROM institutions WHERE latitude IS NOT NULL"
      )
      .get() as any
  ).c;
  const geocodePct =
    instCount > 0 ? ((geocodedCount / instCount) * 100).toFixed(1) : "0";

  console.log("\n=== Database Summary ===");
  console.log(`  Officers:     ${officerCount}`);
  console.log(`  Snapshots:    ${snapshotCount}`);
  console.log(`  Institutions: ${instCount}`);
  console.log(
    `  Geocoded:     ${geocodedCount}/${instCount} (${geocodePct}%)`
  );
  console.log(`  Database:     ${DB_PATH}`);

  // Spot checks
  console.log("\n=== Spot Checks ===");

  // Officers per grade
  const gradeStats = db
    .prepare(
      "SELECT current_grade, COUNT(*) as c FROM officers GROUP BY current_grade ORDER BY c DESC"
    )
    .all() as any[];
  console.log("  Current grade distribution:");
  for (const row of gradeStats) {
    console.log(`    ${row.current_grade}: ${row.c}`);
  }

  // Officers per year
  const yearStats = db
    .prepare(
      "SELECT year, COUNT(*) as c FROM snapshots GROUP BY year ORDER BY year"
    )
    .all() as any[];
  console.log("  Snapshots per year:");
  for (const row of yearStats) {
    console.log(`    ${row.year}: ${row.c}`);
  }

  // Top 5 institutions
  const topInst = db
    .prepare(
      `SELECT institution_id, normalized_institution, COUNT(DISTINCT file_number) as officers
       FROM snapshots WHERE institution_id IS NOT NULL AND institution_id != ''
       GROUP BY institution_id ORDER BY officers DESC LIMIT 5`
    )
    .all() as any[];
  console.log("  Top 5 institutions (by distinct officers):");
  for (const row of topInst) {
    console.log(`    ${row.officers} officers: ${row.normalized_institution}`);
  }

  // Sample promoted officer
  const promoted = db
    .prepare(
      `SELECT file_number, GROUP_CONCAT(DISTINCT grade) as grades
       FROM snapshots GROUP BY file_number
       HAVING COUNT(DISTINCT grade) >= 2 LIMIT 1`
    )
    .get() as any;
  if (promoted) {
    console.log(
      `\n  Sample career (${promoted.file_number}, grades: ${promoted.grades}):`
    );
    const timeline = db
      .prepare(
        `SELECT year, grade, normalized_post, normalized_institution
         FROM snapshots WHERE file_number = ? ORDER BY year`
      )
      .all(promoted.file_number) as any[];
    for (const row of timeline) {
      console.log(
        `    ${row.year} | ${row.grade} | ${row.normalized_post} | ${row.normalized_institution}`
      );
    }
  }

  db.close();
  console.log("\nDone!");
}

main();
