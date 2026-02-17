import { getOfficer, getOfficerMobility, getOfficerGeoProfile } from "@/lib/db";
import { notFound } from "next/navigation";
import GradeBadge from "@/components/GradeBadge";
import OfficerTimeline from "@/components/OfficerTimeline";
import TransferSummary from "@/components/TransferSummary";
import PostingHistory from "@/components/PostingHistory";
import DistrictBreakdown from "@/components/DistrictBreakdown";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, Calendar, Hash, MapPin, Globe } from "lucide-react";

const GeoJourneyMap = dynamic(
  () => import("@/components/GeoJourneyMap"),
  { ssr: false, loading: () => <div className="h-[450px] bg-gray-100 rounded-lg animate-pulse" /> }
);

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export default function OfficerDetailPage({
  params,
}: {
  params: { fileNumber: string };
}) {
  const fileNumber = decodeURIComponent(params.fileNumber);
  const data = getOfficer(fileNumber);

  if (!data) notFound();

  const { officer, snapshots } = data;
  const mobility = getOfficerMobility(fileNumber);
  const geoProfile = getOfficerGeoProfile(fileNumber);
  const hasGeocodedPostings =
    geoProfile != null &&
    geoProfile.postings.some((p) => p.lat != null && p.lng != null);

  const distinctInstitutions = [
    ...new Set(snapshots.map((s) => s.normalizedInstitution).filter(Boolean)),
  ];

  const milestones = [
    { label: "Entry to Grade III", date: officer.dateOfEntryToGradeIII },
    { label: "Promoted to Grade II", date: officer.dateOfPromotionToGradeII },
    { label: "Promoted to Grade I", date: officer.dateOfPromotionToGradeI },
    { label: "Promoted to Special Grade", date: officer.dateOfPromotionToGradeSP },
  ].filter((m) => m.date);

  return (
    <div className="space-y-8">
      <Link
        href="/officers"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Officers
      </Link>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {officer.name}
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              {officer.fileNumber}
            </p>
          </div>
          <GradeBadge grade={officer.currentGrade} size="md" />
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Date of Birth</p>
            <p className="font-medium">{formatDate(officer.dateOfBirth)}</p>
          </div>
          <div>
            <p className="text-gray-500">Current Post</p>
            <p className="font-medium">{officer.currentPost || "—"}</p>
          </div>
          <div>
            <p className="text-gray-500">Current Institution</p>
            <p className="font-medium">{officer.currentWorkplace || "—"}</p>
          </div>
        </div>

        <div className="mt-4 text-sm">
          <p className="text-gray-500">Career Span</p>
          <p className="font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            {officer.firstSeenYear} – {officer.lastSeenYear} (
            {snapshots.length} yearly records)
          </p>
        </div>
      </div>

      {/* Promotion Milestones */}
      {milestones.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Promotion Milestones</h2>
          <div className="flex flex-wrap gap-4">
            {milestones.map((m) => (
              <div
                key={m.label}
                className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2"
              >
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <div>
                  <p className="text-xs text-gray-500">{m.label}</p>
                  <p className="text-sm font-medium">
                    {formatDate(m.date!)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Institutions Served */}
      {distinctInstitutions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">Institutions Served</h2>
          <div className="flex flex-wrap gap-2">
            {distinctInstitutions.map((inst) => (
              <span
                key={inst}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
              >
                <MapPin className="h-3 w-3" />
                {inst}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Geographic Career Profile */}
      {geoProfile && geoProfile.postings.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5 text-gray-400" />
            Geographic Career Profile
          </h2>

          {/* Transfer summary stats */}
          {mobility && mobility.totalTransfers > 0 && (
            <TransferSummary mobility={mobility} />
          )}

          {/* Interactive journey map */}
          {hasGeocodedPostings && <GeoJourneyMap geoProfile={geoProfile} />}

          {/* Posting history cards */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Posting History</h3>
            <PostingHistory geoProfile={geoProfile} />
          </div>

          {/* District breakdown */}
          <DistrictBreakdown geoProfile={geoProfile} />
        </div>
      )}

      {/* Career Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Career Timeline</h2>
        <OfficerTimeline snapshots={snapshots} mobility={mobility} />
      </div>
    </div>
  );
}
