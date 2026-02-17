"use client";

export default function YearFilter({
  years,
  selected,
  onChange,
}: {
  years: number[];
  selected: number | null;
  onChange: (year: number | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1 text-sm rounded-full border transition-colors ${
          selected === null
            ? "bg-sky-600 text-white border-sky-600"
            : "bg-white text-gray-600 border-gray-300 hover:border-sky-300"
        }`}
      >
        All Years
      </button>
      {years.map((year) => (
        <button
          key={year}
          onClick={() => onChange(year === selected ? null : year)}
          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
            selected === year
              ? "bg-sky-600 text-white border-sky-600"
              : "bg-white text-gray-600 border-gray-300 hover:border-sky-300"
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  );
}
