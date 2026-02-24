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
