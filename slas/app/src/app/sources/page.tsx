import { FileText, ExternalLink, Download } from "lucide-react";

const sources = [
  { year: 2021, grade: "sp", gradeLabel: "Special Grade", filename: "2021_sp_grade.pdf", sizeKB: 881 },
  { year: 2021, grade: "i", gradeLabel: "Grade I", filename: "2021_grade_i.pdf", sizeKB: 663 },
  { year: 2021, grade: "ii", gradeLabel: "Grade II", filename: "2021_grade_ii.pdf", sizeKB: 570 },
  { year: 2021, grade: "iii", gradeLabel: "Grade III", filename: "2021_grade_iii.pdf", sizeKB: 694 },
  { year: 2022, grade: "sp", gradeLabel: "Special Grade", filename: "2022_sp_grade.pdf", sizeKB: 692 },
  { year: 2022, grade: "i", gradeLabel: "Grade I", filename: "2022_grade_i.pdf", sizeKB: 875 },
  { year: 2022, grade: "ii", gradeLabel: "Grade II", filename: "2022_grade_ii.pdf", sizeKB: 585 },
  { year: 2022, grade: "iii", gradeLabel: "Grade III", filename: "2022_grade_iii.pdf", sizeKB: 725 },
  { year: 2023, grade: "sp", gradeLabel: "Special Grade", filename: "2023_sp_grade.pdf", sizeKB: 688 },
  { year: 2023, grade: "i", gradeLabel: "Grade I", filename: "2023_grade_i.pdf", sizeKB: 835 },
  { year: 2023, grade: "ii", gradeLabel: "Grade II", filename: "2023_grade_ii.pdf", sizeKB: 788 },
  { year: 2023, grade: "iii", gradeLabel: "Grade III", filename: "2023_grade_iii.pdf", sizeKB: 684 },
  { year: 2024, grade: "sp", gradeLabel: "Special Grade", filename: "2024_sp_grade.pdf", sizeKB: 426 },
  { year: 2024, grade: "i", gradeLabel: "Grade I", filename: "2024_grade_i.pdf", sizeKB: 842 },
  { year: 2024, grade: "ii", gradeLabel: "Grade II", filename: "2024_grade_ii.pdf", sizeKB: 844 },
  { year: 2024, grade: "iii", gradeLabel: "Grade III", filename: "2024_grade_iii.pdf", sizeKB: 730 },
  { year: 2025, grade: "sp", gradeLabel: "Special Grade", filename: "2025_sp_grade.pdf", sizeKB: 824 },
  { year: 2025, grade: "i", gradeLabel: "Grade I", filename: "2025_grade_i.pdf", sizeKB: 1258 },
  { year: 2025, grade: "ii", gradeLabel: "Grade II", filename: "2025_grade_ii.pdf", sizeKB: 948 },
  { year: 2025, grade: "iii", gradeLabel: "Grade III", filename: "2025_grade_iii.pdf", sizeKB: 863 },
];

const years = [2021, 2022, 2023, 2024, 2025];
const grades = [
  { key: "sp", label: "Special Grade" },
  { key: "i", label: "Grade I" },
  { key: "ii", label: "Grade II" },
  { key: "iii", label: "Grade III" },
];

function formatSize(kb: number): string {
  if (kb >= 1000) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

export default function SourcesPage() {
  const lookup = new Map(sources.map((s) => [`${s.year}-${s.grade}`, s]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Sources</h1>
        <p className="mt-2 text-gray-600">
          Original PDF seniority lists published by the Ministry of Public Administration
        </p>
      </div>

      {/* Info card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <h2 className="font-semibold text-blue-900 mb-2">About the Data Pipeline</h2>
        <p className="text-sm text-blue-800 leading-relaxed">
          All officer data in this application is extracted from official PDF seniority lists
          published by the Ministry of Public Administration, Home Affairs, Provincial Councils
          and Local Government. The PDFs are processed through an AI extraction pipeline
          (Python + LLM) to produce structured data stored in SQLite. Due to the nature of
          AI-based extraction, some records may contain inaccuracies — always verify against
          the original documents below.
        </p>
        <a
          href="https://pubad.gov.lk/web/index.php?option=com_content&view=article&id=31&Itemid=136&lang=en"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-blue-700 hover:text-blue-900"
        >
          Visit pubad.gov.lk
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Year × Grade table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Year</th>
                {grades.map((g) => (
                  <th key={g.key} className="text-left px-4 py-3 font-semibold text-gray-700">
                    {g.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {years.map((year) => (
                <tr key={year} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{year}</td>
                  {grades.map((g) => {
                    const src = lookup.get(`${year}-${g.key}`);
                    if (!src) {
                      return (
                        <td key={g.key} className="px-4 py-3 text-gray-400">
                          —
                        </td>
                      );
                    }
                    return (
                      <td key={g.key} className="px-4 py-3">
                        <a
                          href={`/source-pdfs/${src.filename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline"
                        >
                          <FileText className="h-4 w-4 flex-shrink-0" />
                          <span>PDF</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {formatSize(src.sizeKB)}
                          </span>
                        </a>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk download hint */}
      <div className="flex items-start gap-3 text-sm text-gray-500">
        <Download className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          Click any link to open the PDF in your browser. Right-click and &quot;Save As&quot; to
          download. Total archive size is approximately 16 MB across 20 files.
        </p>
      </div>

      {/* Attribution */}
      <div className="border-t border-gray-200 pt-4 text-xs text-gray-400">
        Source documents &copy; Ministry of Public Administration, Home Affairs, Provincial
        Councils and Local Government, Government of Sri Lanka. Reproduced for research
        purposes under fair use.
      </div>
    </div>
  );
}
