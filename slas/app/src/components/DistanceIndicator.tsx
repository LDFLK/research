"use client";

export default function DistanceIndicator({
  distanceKm,
}: {
  distanceKm: number | null;
}) {
  if (distanceKm == null) return null;

  let color: string;
  let label: string;

  if (distanceKm < 50) {
    color = "bg-green-100 text-green-700";
    label = "Local";
  } else if (distanceKm <= 100) {
    color = "bg-amber-100 text-amber-700";
    label = "Medium";
  } else {
    color = "bg-red-100 text-red-700";
    label = "Long";
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${color}`}
    >
      {distanceKm} km
      <span className="opacity-70">({label})</span>
    </span>
  );
}
