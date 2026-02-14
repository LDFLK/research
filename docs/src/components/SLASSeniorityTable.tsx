import React, { useState, useMemo } from 'react';

interface Officer {
  serialNo: number;
  currentSeniorityNo: number;
  fileNumber: string;
  name: string;
  presentPost: string;
  presentWorkPlace: string;
  dateOfBirth: string;
  dateOfEntryToGradeIII: string;
  dateOfPromotionToGradeII: string;
  dateOfPromotionToGradeI?: string;
  dateOfPromotionToGradeSP?: string;
  dateToCompleteCBPCourse?: string;
  dateOfCompletionCBPCourse?: string;
}

interface SeniorityData {
  title: string;
  asAt: string;
  grade: string;
  contactInfo: string;
  officers: Officer[];
}

interface Props {
  data: SeniorityData;
}

type SortField = 'currentSeniorityNo' | 'name';

const ITEMS_PER_PAGE = 25;

export default function SLASSeniorityTable({ data }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('currentSeniorityNo');
  const [sortAsc, setSortAsc] = useState(true);

  const grade = data.grade;

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.officers.filter((o) => {
      if (!term) return true;
      return (
        o.name.toLowerCase().includes(term) ||
        o.presentPost.toLowerCase().includes(term) ||
        o.presentWorkPlace.toLowerCase().includes(term) ||
        o.fileNumber.toLowerCase().includes(term)
      );
    });
  }, [data.officers, searchTerm]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      if (sortField === 'name') {
        const cmp = a.name.localeCompare(b.name);
        return sortAsc ? cmp : -cmp;
      }
      const cmp = a.currentSeniorityNo - b.currentSeniorityNo;
      return sortAsc ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortField, sortAsc]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sorted.slice(start, start + ITEMS_PER_PAGE);
  }, [sorted, currentPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
    setCurrentPage(1);
  };

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return ' ↕';
    return sortAsc ? ' ↑' : ' ↓';
  };

  const nowrap = { whiteSpace: 'nowrap' as const };

  return (
    <div className="margin-vert--lg">
      {/* Header stats */}
      <div className="alert alert--info margin-bottom--md">
        <strong>{data.officers.length}</strong> officers in the{' '}
        <strong>{data.grade}</strong> — as at{' '}
        <strong>{data.asAt}</strong>
      </div>

      {/* Search */}
      <div className="row margin-bottom--md">
        <div className="col col--8">
          <input
            type="text"
            className="button button--outline button--secondary button--block"
            style={{ textAlign: 'left', cursor: 'text' }}
            placeholder="Search by name, post, workplace, or file number..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="col col--4">
          <div className="badge badge--secondary" style={{ lineHeight: '2.2' }}>
            {filtered.length} of {data.officers.length} shown
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="table table--striped table--hover">
          <thead>
            <tr>
              <th
                style={{ cursor: 'pointer', ...nowrap }}
                onClick={() => handleSort('currentSeniorityNo')}
              >
                #Seniority{sortIcon('currentSeniorityNo')}
              </th>
              <th>File No.</th>
              <th
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('name')}
              >
                Name{sortIcon('name')}
              </th>
              <th>Present Post</th>
              <th>Present Work Place</th>
              <th style={nowrap}>Date of Birth</th>
              <th style={nowrap}>Entry Gr. III</th>
              {grade !== 'Grade III' && <th style={nowrap}>Prom. Gr. II</th>}
              {(grade === 'Special Grade' || grade === 'Grade I') && <th style={nowrap}>Prom. Gr. I</th>}
              {grade === 'Special Grade' && <th style={nowrap}>Prom. Sp. Gr.</th>}
              {grade === 'Grade I' && (
                <>
                  <th style={nowrap}>CBP Due</th>
                  <th style={nowrap}>CBP Done</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {pageData.map((o) => (
              <tr key={o.serialNo}>
                <td>{o.currentSeniorityNo}</td>
                <td style={nowrap}>{o.fileNumber}</td>
                <td style={nowrap}>{o.name}</td>
                <td><small>{o.presentPost}</small></td>
                <td><small>{o.presentWorkPlace}</small></td>
                <td style={nowrap}><small>{o.dateOfBirth}</small></td>
                <td style={nowrap}><small>{o.dateOfEntryToGradeIII}</small></td>
                {grade !== 'Grade III' && (
                  <td style={nowrap}><small>{o.dateOfPromotionToGradeII}</small></td>
                )}
                {(grade === 'Special Grade' || grade === 'Grade I') && (
                  <td style={nowrap}><small>{o.dateOfPromotionToGradeI}</small></td>
                )}
                {grade === 'Special Grade' && (
                  <td style={nowrap}><small>{o.dateOfPromotionToGradeSP}</small></td>
                )}
                {grade === 'Grade I' && (
                  <>
                    <td style={nowrap}><small>{o.dateToCompleteCBPCourse}</small></td>
                    <td style={nowrap}><small>{o.dateOfCompletionCBPCourse}</small></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="text--center margin-top--md">
          <button
            className="button button--secondary button--sm margin-right--sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>
          <span className="margin-horiz--sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="button button--secondary button--sm margin-left--sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text--center margin-vert--xl">
          <p>No officers found matching your search.</p>
        </div>
      )}

      {/* Contact note */}
      <div className="margin-top--lg" style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
        {data.contactInfo}
      </div>
    </div>
  );
}
