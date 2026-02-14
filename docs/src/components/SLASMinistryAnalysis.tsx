import React, { useState, useMemo } from 'react';

interface OfficerCounts {
  total: number;
  SP: number;
  GI: number;
  GII: number;
  GIII: number;
}

interface TopRole {
  post: string;
  count: number;
}

interface Institution {
  id: string;
  name: string;
  officers: OfficerCounts;
  avgAge: number | null;
  topRoles: TopRole[];
  rawWorkplaces: string[];
}

interface Summary {
  totalInstitutions: number;
  fieldAdministrationTotal: number;
  provincialTotal: number;
  largestMinistry: string | null;
  ministriesCount: number;
}

interface MinistryData {
  asAt: string;
  totalOfficers: number;
  institutions: Institution[];
  summary: Summary;
}

interface Props {
  data: MinistryData;
}

type SortField = 'total' | 'name' | 'avgAge' | 'SP' | 'GI' | 'GII' | 'GIII';
type GradeFilter = 'all' | 'SP' | 'GI' | 'GII' | 'GIII';

const ITEMS_PER_PAGE = 25;

const GRADE_LABELS: Record<string, string> = {
  SP: 'Special Grade',
  GI: 'Grade I',
  GII: 'Grade II',
  GIII: 'Grade III',
};

export default function SLASMinistryAnalysis({ data }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('total');
  const [sortAsc, setSortAsc] = useState(false);
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedInst, setExpandedInst] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    let items = data.institutions;
    if (term) {
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(term) ||
          i.rawWorkplaces.some((w) => w.toLowerCase().includes(term)),
      );
    }
    if (gradeFilter !== 'all') {
      items = items.filter((i) => i.officers[gradeFilter] > 0);
    }
    return items;
  }, [data.institutions, searchTerm, gradeFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let va: number | string;
      let vb: number | string;
      if (sortField === 'name') {
        va = a.name.toLowerCase();
        vb = b.name.toLowerCase();
      } else if (sortField === 'avgAge') {
        va = a.avgAge || 0;
        vb = b.avgAge || 0;
      } else if (sortField === 'total') {
        va = a.officers.total;
        vb = b.officers.total;
      } else {
        va = a.officers[sortField];
        vb = b.officers[sortField];
      }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortField, sortAsc]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sorted.slice(start, start + ITEMS_PER_PAGE);
  }, [sorted, currentPage]);

  const filteredTotal = useMemo(
    () => filtered.reduce((sum, i) => sum + i.officers.total, 0),
    [filtered],
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'name');
    }
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Top 15 for the bar chart
  const top15 = useMemo(() => data.institutions.slice(0, 15), [data.institutions]);
  const maxCount = top15[0]?.officers.total || 1;

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return '';
    return sortAsc ? ' \u25B2' : ' \u25BC';
  };

  const nowrap = { whiteSpace: 'nowrap' as const };

  return (
    <div className="margin-vert--lg">
      {/* Summary cards */}
      <div className="row margin-bottom--lg">
        <div className="col col--3">
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ifm-color-primary)' }}>
              {data.summary.totalInstitutions}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
              Institutions
            </div>
          </div>
        </div>
        <div className="col col--3">
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#059669' }}>
              {data.summary.fieldAdministrationTotal}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
              Field Administration
            </div>
          </div>
        </div>
        <div className="col col--3">
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#D97706' }}>
              {data.summary.provincialTotal}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
              Provincial Councils
            </div>
          </div>
        </div>
        <div className="col col--3">
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#7C3AED' }}>
              {data.summary.ministriesCount}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
              Ministries
            </div>
          </div>
        </div>
      </div>

      <div className="alert alert--info margin-bottom--md">
        <strong>{data.totalOfficers.toLocaleString()}</strong> officers across{' '}
        <strong>{data.summary.totalInstitutions}</strong> institutions &mdash; as at <strong>{data.asAt}</strong>
      </div>

      {/* Top 15 bar chart */}
      <h3>Top 15 Institutions by Officer Count</h3>
      <div className="margin-bottom--lg">
        {top15.map((inst) => {
          const pct = ((inst.officers.total / data.totalOfficers) * 100).toFixed(1);
          return (
            <div
              key={inst.id}
              className="margin-bottom--sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <div
                style={{
                  width: 280,
                  fontSize: '0.8rem',
                  textAlign: 'right',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  ...nowrap,
                }}
                title={inst.name}
              >
                {inst.name.length > 40 ? inst.name.substring(0, 37) + '...' : inst.name}
              </div>
              <div
                style={{
                  flex: 1,
                  background: 'var(--ifm-color-emphasis-200)',
                  borderRadius: 4,
                  height: 24,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${(inst.officers.total / maxCount) * 100}%`,
                    background: 'var(--ifm-color-primary)',
                    height: '100%',
                    borderRadius: 4,
                    transition: 'width 0.3s ease',
                    minWidth: 2,
                  }}
                />
              </div>
              <div style={{ width: 90, fontSize: '0.8rem', ...nowrap }}>
                {inst.officers.total} ({pct}%)
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <h3>Institution Directory</h3>
      <div className="row margin-bottom--md">
        <div className="col col--5">
          <input
            type="text"
            className="button button--outline button--secondary button--block"
            style={{ textAlign: 'left', cursor: 'text' }}
            placeholder="Search institutions..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="col col--3">
          <select
            className="button button--outline button--secondary button--block"
            style={{ textAlign: 'left', cursor: 'pointer' }}
            value={gradeFilter}
            onChange={(e) => { setGradeFilter(e.target.value as GradeFilter); setCurrentPage(1); }}
          >
            <option value="all">All Grades</option>
            <option value="SP">Special Grade only</option>
            <option value="GI">Grade I only</option>
            <option value="GII">Grade II only</option>
            <option value="GIII">Grade III only</option>
          </select>
        </div>
        <div className="col col--4">
          <div className="badge badge--secondary" style={{ lineHeight: '2.2' }}>
            {filtered.length} institutions ({filteredTotal} officers)
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="table table--striped table--hover" style={{ fontSize: '0.85rem' }}>
          <thead>
            <tr>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                Institution{sortIndicator('name')}
              </th>
              <th style={{ ...nowrap, cursor: 'pointer' }} onClick={() => handleSort('total')}>
                Total{sortIndicator('total')}
              </th>
              <th style={{ ...nowrap, cursor: 'pointer' }} onClick={() => handleSort('SP')}>
                SP{sortIndicator('SP')}
              </th>
              <th style={{ ...nowrap, cursor: 'pointer' }} onClick={() => handleSort('GI')}>
                GI{sortIndicator('GI')}
              </th>
              <th style={{ ...nowrap, cursor: 'pointer' }} onClick={() => handleSort('GII')}>
                GII{sortIndicator('GII')}
              </th>
              <th style={{ ...nowrap, cursor: 'pointer' }} onClick={() => handleSort('GIII')}>
                GIII{sortIndicator('GIII')}
              </th>
              <th style={{ ...nowrap, cursor: 'pointer' }} onClick={() => handleSort('avgAge')}>
                Avg Age{sortIndicator('avgAge')}
              </th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((inst) => (
              <React.Fragment key={inst.id}>
                <tr
                  style={{ cursor: inst.topRoles.length > 0 ? 'pointer' : 'default' }}
                  onClick={() =>
                    inst.topRoles.length > 0 &&
                    setExpandedInst(expandedInst === inst.id ? null : inst.id)
                  }
                >
                  <td>
                    <strong>{inst.name}</strong>
                    {inst.topRoles.length > 0 && (
                      <span style={{ marginLeft: 6, fontSize: '0.75rem', opacity: 0.6 }}>
                        {expandedInst === inst.id ? '\u25BC' : '\u25B6'}
                      </span>
                    )}
                  </td>
                  <td style={nowrap}><strong>{inst.officers.total}</strong></td>
                  <td style={nowrap}>{inst.officers.SP || '\u2013'}</td>
                  <td style={nowrap}>{inst.officers.GI || '\u2013'}</td>
                  <td style={nowrap}>{inst.officers.GII || '\u2013'}</td>
                  <td style={nowrap}>{inst.officers.GIII || '\u2013'}</td>
                  <td style={nowrap}>{inst.avgAge ?? '\u2013'}</td>
                </tr>
                {expandedInst === inst.id && (
                  <tr>
                    <td colSpan={7} style={{ background: 'var(--ifm-color-emphasis-100)', padding: '0.5rem 1rem' }}>
                      <small>
                        <strong>Top roles:</strong>{' '}
                        {inst.topRoles.map((r, i) => (
                          <span key={i}>
                            {r.post} (<strong>{r.count}</strong>)
                            {i < inst.topRoles.length - 1 && ', '}
                          </span>
                        ))}
                      </small>
                    </td>
                  </tr>
                )}
              </React.Fragment>
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
          <p>No institutions found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
