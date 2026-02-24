export type Grade = "SP" | "GI" | "GII" | "GIII";

export type TransferType = 'geographic' | 'administrative' | 'unknown';

export interface Officer {
  fileNumber: string;
  name: string;
  dateOfBirth: string | null;
  dateOfEntryToGradeIII: string | null;
  dateOfPromotionToGradeII: string | null;
  dateOfPromotionToGradeI: string | null;
  dateOfPromotionToGradeSP: string | null;
  firstSeenYear: number;
  lastSeenYear: number;
  currentGrade: Grade;
  currentPost: string;
  currentWorkplace: string;
}

export interface Snapshot {
  year: number;
  grade: Grade;
  seniorityNo: number;
  rawPost: string;
  normalizedPost: string;
  postKindMajor: string;
  postKindMinor: string;
  workplace: string;
  normalizedInstitution: string;
  institutionId: string | null;
}

export interface Institution {
  id: string;
  name: string;
  kindMajor: string;
  kindMinor: string;
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  district: string | null;
}

export interface Transfer {
  fromYear: number;
  toYear: number;
  fromInstitution: string;
  toInstitution: string;
  fromInstitutionId: string | null;
  toInstitutionId: string | null;
  fromLat: number | null;
  fromLng: number | null;
  toLat: number | null;
  toLng: number | null;
  distanceKm: number | null;
  transferType: TransferType;
}

export interface OfficerMobility {
  totalTransfers: number;
  totalDistanceKm: number;
  avgDistanceKm: number;
  maxDistanceKm: number;
  maxTransferDesc: string;
  transfers: Transfer[];
  locations: { lat: number; lng: number; name: string; years: number[]; grade: Grade }[];
  geographicTransfers: number;
  geographicTotalDistanceKm: number;
  geographicAvgDistanceKm: number;
  geographicMaxDistanceKm: number;
  geographicMaxTransferDesc: string;
  administrativeChanges: number;
  unknownTransfers: number;
}

export interface GeoPostingDetail {
  institution: string;
  institutionId: string | null;
  lat: number | null;
  lng: number | null;
  locationName: string | null;
  district: string | null;
  years: number[];
  grades: Grade[];
  posts: string[];
  institutionType: string;
  durationYears: number;
  distanceFromPrevKm: number | null;
  alternateNames: { name: string; institutionId: string | null; years: number[] }[];
  isAdministrativeGroup: boolean;
}

export interface GeoProfile {
  postings: GeoPostingDetail[];
  yearMap: Record<number, GeoPostingDetail>;
  districtBreakdown: { district: string; years: number; postings: number }[];
  fieldVsHqRatio: { field: number; hq: number };
  totalDistinctLocations: number;
  geographicSpreadKm: number;
}

export interface MobilityStats {
  totalOfficersWithTransfers: number;
  avgTransfersPerOfficer: number;
  avgDistancePerTransfer: number;
  longDistanceTransfers: number;
  distanceHistogram: { bucket: string; count: number }[];
  topLongDistanceRoutes: { from: string; to: string; count: number; avgDistKm: number }[];
  totalAdministrativeChanges: number;
  geographicAvgTransfersPerOfficer: number;
}

export interface DashboardStats {
  totalOfficers: number;
  totalSnapshots: number;
  totalInstitutions: number;
  years: number[];
  gradeDistribution: { grade: Grade; count: number }[];
  yearlyBreakdown: { year: number; grade: Grade; count: number }[];
}

/** Single officer position for a given year */
export interface MapOfficerPoint {
  fileNumber: string;
  name: string;
  grade: Grade;
  institutionId: string;
  institution: string;
  lat: number;
  lng: number;
  district: string | null;
  post: string | null;
}

/** All geocoded officer positions for one year */
export interface MapYearFrame {
  year: number;
  points: MapOfficerPoint[];
}

/** Full API response for global map */
export interface GlobalMapData {
  years: number[];
  frames: MapYearFrame[];
  excludedCount: number;
}

/** Lightweight officer entry for the picker sidebar */
export interface MapOfficerEntry {
  fileNumber: string;
  name: string;
  currentGrade: Grade;
  firstSeenYear: number;
  lastSeenYear: number;
}

/** Province/district name-code lists for the boundary filter UI */
export interface BoundaryMeta {
  provinces: { code: string; name: string }[];
  districts: { code: string; name: string; provinceCode: string }[];
}

/** Current geographic filter selection */
export interface GeoFilter {
  provinceCode: string | null;
  districtName: string | null;
}
