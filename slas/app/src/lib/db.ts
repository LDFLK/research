import Database from "better-sqlite3";
import { join } from "path";
import type {
  Officer,
  Snapshot,
  Institution,
  DashboardStats,
  Grade,
  Transfer,
  OfficerMobility,
  MobilityStats,
  GeoProfile,
  GeoPostingDetail,
} from "./types";
import { haversineDistance } from "./geo";

const DB_PATH = join(process.cwd(), "data", "slas.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true });
    _db.pragma("journal_mode = WAL");
  }
  return _db;
}

// ── Officers ─────────────────────────────────────────────────────────

function rowToOfficer(row: any): Officer {
  return {
    fileNumber: row.file_number,
    name: row.name,
    dateOfBirth: row.date_of_birth || null,
    dateOfEntryToGradeIII: row.date_of_entry_grade_iii || null,
    dateOfPromotionToGradeII: row.date_of_promotion_grade_ii || null,
    dateOfPromotionToGradeI: row.date_of_promotion_grade_i || null,
    dateOfPromotionToGradeSP: row.date_of_promotion_grade_sp || null,
    firstSeenYear: row.first_seen_year,
    lastSeenYear: row.last_seen_year,
    currentGrade: row.current_grade as Grade,
    currentPost: row.current_post,
    currentWorkplace: row.current_workplace,
  };
}

export function searchOfficers(params: {
  q?: string;
  grade?: string;
  year?: number;
  page?: number;
  limit?: number;
}): { officers: Officer[]; total: number } {
  const db = getDb();
  const { q, grade, year, page = 1, limit = 50 } = params;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const bindings: any[] = [];

  if (q) {
    conditions.push("(o.name LIKE ? OR o.file_number LIKE ?)");
    bindings.push(`%${q}%`, `%${q}%`);
  }
  if (grade) {
    conditions.push("o.current_grade = ?");
    bindings.push(grade);
  }
  if (year) {
    conditions.push(
      "EXISTS (SELECT 1 FROM snapshots s WHERE s.file_number = o.file_number AND s.year = ?)"
    );
    bindings.push(year);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const total = (
    db
      .prepare(`SELECT COUNT(*) as c FROM officers o ${where}`)
      .get(...bindings) as any
  ).c;

  const rows = db
    .prepare(
      `SELECT * FROM officers o ${where} ORDER BY o.current_grade, o.name LIMIT ? OFFSET ?`
    )
    .all(...bindings, limit, offset) as any[];

  return { officers: rows.map(rowToOfficer), total };
}

export function getOfficer(
  fileNumber: string
): { officer: Officer; snapshots: Snapshot[] } | null {
  const db = getDb();

  const row = db
    .prepare("SELECT * FROM officers WHERE file_number = ?")
    .get(fileNumber) as any;
  if (!row) return null;

  const snapRows = db
    .prepare(
      "SELECT * FROM snapshots WHERE file_number = ? ORDER BY year"
    )
    .all(fileNumber) as any[];

  const snapshots: Snapshot[] = snapRows.map((s) => ({
    year: s.year,
    grade: s.grade as Grade,
    seniorityNo: s.seniority_no,
    rawPost: s.raw_post,
    normalizedPost: s.normalized_post,
    postKindMajor: s.post_kind_major,
    postKindMinor: s.post_kind_minor,
    workplace: s.workplace,
    normalizedInstitution: s.normalized_institution,
    institutionId: s.institution_id,
  }));

  return { officer: rowToOfficer(row), snapshots };
}

// ── Institutions ────────────────────────────────────────────────────

export function searchInstitutions(params: {
  q?: string;
  type?: string;
  page?: number;
  limit?: number;
}): { institutions: (Institution & { officerCount: number })[]; total: number } {
  const db = getDb();
  const { q, type, page = 1, limit = 50 } = params;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const bindings: any[] = [];

  if (q) {
    conditions.push("i.name LIKE ?");
    bindings.push(`%${q}%`);
  }
  if (type) {
    conditions.push("i.kind_minor = ?");
    bindings.push(type);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const total = (
    db
      .prepare(`SELECT COUNT(*) as c FROM institutions i ${where}`)
      .get(...bindings) as any
  ).c;

  const rows = db
    .prepare(
      `SELECT i.*, COUNT(DISTINCT s.file_number) as officer_count
       FROM institutions i
       LEFT JOIN snapshots s ON s.institution_id = i.id
       ${where}
       GROUP BY i.id
       ORDER BY officer_count DESC
       LIMIT ? OFFSET ?`
    )
    .all(...bindings, limit, offset) as any[];

  return {
    institutions: rows.map((r) => ({
      id: r.id,
      name: r.name,
      kindMajor: r.kind_major,
      kindMinor: r.kind_minor,
      latitude: r.latitude ?? null,
      longitude: r.longitude ?? null,
      locationName: r.location_name ?? null,
      district: r.district ?? null,
      officerCount: r.officer_count,
    })),
    total,
  };
}

export function getInstitution(id: string): {
  institution: Institution;
  officersByYear: {
    year: number;
    officers: {
      fileNumber: string;
      name: string;
      grade: Grade;
      post: string;
    }[];
  }[];
} | null {
  const db = getDb();

  const row = db
    .prepare("SELECT * FROM institutions WHERE id = ?")
    .get(id) as any;
  if (!row) return null;

  const institution: Institution = {
    id: row.id,
    name: row.name,
    kindMajor: row.kind_major,
    kindMinor: row.kind_minor,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    locationName: row.location_name ?? null,
    district: row.district ?? null,
  };

  const snapRows = db
    .prepare(
      `SELECT s.year, s.file_number, o.name, s.grade, s.normalized_post
       FROM snapshots s
       JOIN officers o ON o.file_number = s.file_number
       WHERE s.institution_id = ?
       ORDER BY s.year DESC, s.grade, o.name`
    )
    .all(id) as any[];

  const yearMap = new Map<
    number,
    { fileNumber: string; name: string; grade: Grade; post: string }[]
  >();
  for (const s of snapRows) {
    if (!yearMap.has(s.year)) yearMap.set(s.year, []);
    yearMap.get(s.year)!.push({
      fileNumber: s.file_number,
      name: s.name,
      grade: s.grade as Grade,
      post: s.normalized_post,
    });
  }

  const officersByYear = Array.from(yearMap.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, officers]) => ({ year, officers }));

  return { institution, officersByYear };
}

// ── Dashboard ───────────────────────────────────────────────────────

export function getDashboardStats(): DashboardStats {
  const db = getDb();

  const totalOfficers = (
    db.prepare("SELECT COUNT(*) as c FROM officers").get() as any
  ).c;
  const totalSnapshots = (
    db.prepare("SELECT COUNT(*) as c FROM snapshots").get() as any
  ).c;
  const totalInstitutions = (
    db.prepare("SELECT COUNT(*) as c FROM institutions").get() as any
  ).c;

  const yearRows = db
    .prepare("SELECT DISTINCT year FROM snapshots ORDER BY year")
    .all() as any[];
  const years = yearRows.map((r) => r.year);

  const gradeRows = db
    .prepare(
      "SELECT current_grade as grade, COUNT(*) as count FROM officers GROUP BY current_grade ORDER BY count DESC"
    )
    .all() as any[];
  const gradeDistribution = gradeRows.map((r) => ({
    grade: r.grade as Grade,
    count: r.count,
  }));

  const yearlyRows = db
    .prepare(
      "SELECT year, grade, COUNT(*) as count FROM snapshots GROUP BY year, grade ORDER BY year, grade"
    )
    .all() as any[];
  const yearlyBreakdown = yearlyRows.map((r) => ({
    year: r.year,
    grade: r.grade as Grade,
    count: r.count,
  }));

  return {
    totalOfficers,
    totalSnapshots,
    totalInstitutions,
    years,
    gradeDistribution,
    yearlyBreakdown,
  };
}

// ── Mobility ────────────────────────────────────────────────────────

export function getOfficerMobility(fileNumber: string): OfficerMobility | null {
  const db = getDb();

  const rows = db
    .prepare(
      `SELECT s.year, s.grade, s.normalized_institution, s.institution_id,
              i.latitude, i.longitude, i.location_name
       FROM snapshots s
       LEFT JOIN institutions i ON i.id = s.institution_id
       WHERE s.file_number = ?
       ORDER BY s.year`
    )
    .all(fileNumber) as any[];

  if (rows.length === 0) return null;

  const transfers: Transfer[] = [];
  const locationMap = new Map<
    string,
    { lat: number; lng: number; name: string; years: number[]; grade: Grade }
  >();

  for (let i = 0; i < rows.length; i++) {
    const cur = rows[i];
    const locKey = cur.institution_id || cur.normalized_institution;
    if (cur.latitude != null && cur.longitude != null && locKey) {
      if (!locationMap.has(locKey)) {
        locationMap.set(locKey, {
          lat: cur.latitude,
          lng: cur.longitude,
          name: cur.normalized_institution,
          years: [],
          grade: cur.grade as Grade,
        });
      }
      locationMap.get(locKey)!.years.push(cur.year);
    }

    if (i === 0) continue;
    const prev = rows[i - 1];
    const prevInstId = prev.institution_id || prev.normalized_institution;
    const curInstId = cur.institution_id || cur.normalized_institution;
    if (prevInstId === curInstId) continue;

    let distanceKm: number | null = null;
    if (
      prev.latitude != null &&
      prev.longitude != null &&
      cur.latitude != null &&
      cur.longitude != null
    ) {
      distanceKm = Math.round(
        haversineDistance(prev.latitude, prev.longitude, cur.latitude, cur.longitude)
      );
    }

    transfers.push({
      fromYear: prev.year,
      toYear: cur.year,
      fromInstitution: prev.normalized_institution,
      toInstitution: cur.normalized_institution,
      fromInstitutionId: prev.institution_id || null,
      toInstitutionId: cur.institution_id || null,
      fromLat: prev.latitude ?? null,
      fromLng: prev.longitude ?? null,
      toLat: cur.latitude ?? null,
      toLng: cur.longitude ?? null,
      distanceKm,
    });
  }

  const distances = transfers
    .map((t) => t.distanceKm)
    .filter((d): d is number => d != null);
  const totalDistanceKm = distances.reduce((a, b) => a + b, 0);
  const maxDistanceKm = distances.length > 0 ? Math.max(...distances) : 0;
  const avgDistanceKm =
    distances.length > 0 ? Math.round(totalDistanceKm / distances.length) : 0;

  let maxTransferDesc = "";
  if (maxDistanceKm > 0) {
    const maxT = transfers.find((t) => t.distanceKm === maxDistanceKm);
    if (maxT) {
      maxTransferDesc = `${maxT.fromInstitution} → ${maxT.toInstitution}`;
    }
  }

  return {
    totalTransfers: transfers.length,
    totalDistanceKm,
    avgDistanceKm,
    maxDistanceKm,
    maxTransferDesc,
    transfers,
    locations: Array.from(locationMap.values()),
  };
}

// ── Geo Profile ──────────────────────────────────────────────────────

export function getOfficerGeoProfile(fileNumber: string): GeoProfile | null {
  const db = getDb();

  const rows = db
    .prepare(
      `SELECT s.year, s.grade, s.normalized_post, s.normalized_institution, s.institution_id,
              i.latitude, i.longitude, i.location_name, i.kind_minor, i.district
       FROM snapshots s
       LEFT JOIN institutions i ON i.id = s.institution_id
       WHERE s.file_number = ?
       ORDER BY s.year`
    )
    .all(fileNumber) as any[];

  if (rows.length === 0) return null;

  // Group consecutive years at same institution into posting stints
  const postings: GeoPostingDetail[] = [];
  let currentPosting: {
    institution: string;
    institutionId: string | null;
    lat: number | null;
    lng: number | null;
    locationName: string | null;
    district: string | null;
    years: number[];
    grades: Set<Grade>;
    posts: Set<string>;
    institutionType: string;
  } | null = null;

  for (const row of rows) {
    const instKey = row.institution_id || row.normalized_institution;
    const prevKey = currentPosting
      ? currentPosting.institutionId || currentPosting.institution
      : null;

    if (currentPosting && instKey === prevKey) {
      // Same institution — extend current posting
      currentPosting.years.push(row.year);
      currentPosting.grades.add(row.grade as Grade);
      if (row.normalized_post) currentPosting.posts.add(row.normalized_post);
    } else {
      // New institution — finalize previous and start new
      if (currentPosting) {
        postings.push(finalizePosting(currentPosting, postings));
      }
      currentPosting = {
        institution: row.normalized_institution,
        institutionId: row.institution_id || null,
        lat: row.latitude ?? null,
        lng: row.longitude ?? null,
        locationName: row.location_name ?? null,
        district: row.district ?? null,
        years: [row.year],
        grades: new Set([row.grade as Grade]),
        posts: new Set(row.normalized_post ? [row.normalized_post] : []),
        institutionType: row.kind_minor || "",
      };
    }
  }
  if (currentPosting) {
    postings.push(finalizePosting(currentPosting, postings));
  }

  // Build yearMap
  const yearMap: Record<number, GeoPostingDetail> = {};
  for (const posting of postings) {
    for (const year of posting.years) {
      yearMap[year] = posting;
    }
  }

  // District breakdown
  const districtMap = new Map<string, { years: Set<number>; postings: number }>();
  for (const posting of postings) {
    const d = posting.district || "Unknown";
    if (!districtMap.has(d)) districtMap.set(d, { years: new Set(), postings: 0 });
    const entry = districtMap.get(d)!;
    entry.postings++;
    for (const y of posting.years) entry.years.add(y);
  }
  const districtBreakdown = Array.from(districtMap.entries())
    .map(([district, data]) => ({
      district,
      years: data.years.size,
      postings: data.postings,
    }))
    .sort((a, b) => b.years - a.years);

  // Field vs HQ ratio
  const fieldTypes = new Set(["divisional-secretariat", "district-secretariat"]);
  const hqTypes = new Set(["ministry", "department", "commission", "secretariat", "statutory-body"]);
  let fieldYears = 0;
  let hqYears = 0;
  for (const posting of postings) {
    const duration = posting.durationYears;
    if (fieldTypes.has(posting.institutionType)) {
      fieldYears += duration;
    } else if (hqTypes.has(posting.institutionType)) {
      hqYears += duration;
    }
  }

  // Geographic spread: max haversine distance between any pair
  let geographicSpreadKm = 0;
  const geocoded = postings.filter((p) => p.lat != null && p.lng != null);
  for (let i = 0; i < geocoded.length; i++) {
    for (let j = i + 1; j < geocoded.length; j++) {
      const d = haversineDistance(
        geocoded[i].lat!,
        geocoded[i].lng!,
        geocoded[j].lat!,
        geocoded[j].lng!
      );
      if (d > geographicSpreadKm) geographicSpreadKm = d;
    }
  }

  return {
    postings,
    yearMap,
    districtBreakdown,
    fieldVsHqRatio: { field: fieldYears, hq: hqYears },
    totalDistinctLocations: geocoded.length,
    geographicSpreadKm: Math.round(geographicSpreadKm),
  };
}

function finalizePosting(
  current: {
    institution: string;
    institutionId: string | null;
    lat: number | null;
    lng: number | null;
    locationName: string | null;
    district: string | null;
    years: number[];
    grades: Set<Grade>;
    posts: Set<string>;
    institutionType: string;
  },
  previousPostings: GeoPostingDetail[]
): GeoPostingDetail {
  let distanceFromPrevKm: number | null = null;
  if (previousPostings.length > 0) {
    const prev = previousPostings[previousPostings.length - 1];
    if (
      prev.lat != null &&
      prev.lng != null &&
      current.lat != null &&
      current.lng != null
    ) {
      distanceFromPrevKm = Math.round(
        haversineDistance(prev.lat, prev.lng, current.lat, current.lng)
      );
    }
  }

  return {
    institution: current.institution,
    institutionId: current.institutionId,
    lat: current.lat,
    lng: current.lng,
    locationName: current.locationName,
    district: current.district,
    years: current.years,
    grades: Array.from(current.grades),
    posts: Array.from(current.posts),
    institutionType: current.institutionType,
    durationYears: current.years.length,
    distanceFromPrevKm,
  };
}

export function getMobilityStats(): MobilityStats {
  const db = getDb();

  // Get all officers who have 2+ different institutions
  const officerRows = db
    .prepare(
      `SELECT file_number FROM snapshots
       GROUP BY file_number
       HAVING COUNT(DISTINCT institution_id) >= 2`
    )
    .all() as any[];

  let totalTransfers = 0;
  let totalDistance = 0;
  let distanceCount = 0;
  let longDistanceCount = 0;
  const buckets: Record<string, number> = {
    "0-10 km": 0,
    "10-25 km": 0,
    "25-50 km": 0,
    "50-100 km": 0,
    "100-200 km": 0,
    "200+ km": 0,
  };
  const routeMap = new Map<
    string,
    { from: string; to: string; distances: number[] }
  >();

  for (const { file_number } of officerRows) {
    const mobility = getOfficerMobility(file_number);
    if (!mobility) continue;

    totalTransfers += mobility.totalTransfers;
    for (const t of mobility.transfers) {
      if (t.distanceKm == null) continue;
      distanceCount++;
      totalDistance += t.distanceKm;

      if (t.distanceKm > 100) longDistanceCount++;

      if (t.distanceKm <= 10) buckets["0-10 km"]++;
      else if (t.distanceKm <= 25) buckets["10-25 km"]++;
      else if (t.distanceKm <= 50) buckets["25-50 km"]++;
      else if (t.distanceKm <= 100) buckets["50-100 km"]++;
      else if (t.distanceKm <= 200) buckets["100-200 km"]++;
      else buckets["200+ km"]++;

      // Track routes for top long-distance
      if (t.distanceKm > 50 && t.fromInstitutionId && t.toInstitutionId) {
        const ids = [t.fromInstitutionId, t.toInstitutionId].sort();
        const key = ids.join("||");
        if (!routeMap.has(key)) {
          routeMap.set(key, {
            from: t.fromInstitution,
            to: t.toInstitution,
            distances: [],
          });
        }
        routeMap.get(key)!.distances.push(t.distanceKm);
      }
    }
  }

  const distanceHistogram = Object.entries(buckets).map(([bucket, count]) => ({
    bucket,
    count,
  }));

  const topLongDistanceRoutes = Array.from(routeMap.values())
    .filter((r) => r.distances.length >= 2)
    .map((r) => ({
      from: r.from,
      to: r.to,
      count: r.distances.length,
      avgDistKm: Math.round(
        r.distances.reduce((a, b) => a + b, 0) / r.distances.length
      ),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalOfficersWithTransfers: officerRows.length,
    avgTransfersPerOfficer:
      officerRows.length > 0
        ? Math.round((totalTransfers / officerRows.length) * 10) / 10
        : 0,
    avgDistancePerTransfer:
      distanceCount > 0 ? Math.round(totalDistance / distanceCount) : 0,
    longDistanceTransfers: longDistanceCount,
    distanceHistogram,
    topLongDistanceRoutes,
  };
}
