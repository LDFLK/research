import React, { useState, useMemo } from 'react';

/* ===== Types ===== */

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
}

interface SeniorityData {
  title: string;
  asAt: string;
  grade: string;
  officers: Officer[];
}

type GradeKey = 'SP' | 'GI' | 'GII' | 'GIII';

interface TaggedOfficer extends Officer {
  grade: GradeKey;
  gradeLabel: string;
}

interface Props {
  spData: SeniorityData;
  g1Data: SeniorityData;
  g2Data: SeniorityData;
  g3Data: SeniorityData;
}

type SearchMode = 'institution' | 'role';

const GRADE_ORDER: GradeKey[] = ['SP', 'GI', 'GII', 'GIII'];
const GRADE_LABELS: Record<GradeKey, string> = {
  SP: 'Special Grade',
  GI: 'Grade I',
  GII: 'Grade II',
  GIII: 'Grade III',
};
const GRADE_COLORS: Record<GradeKey, string> = {
  SP: '#7C3AED',
  GI: '#0E4D6B',
  GII: '#059669',
  GIII: '#D97706',
};

const ITEMS_PER_PAGE = 20;

/* ===== Component ===== */

export default function SLASPeopleFinder({ spData, g1Data, g2Data, g3Data }: Props) {
  const [searchMode, setSearchMode] = useState<SearchMode>('institution');
  const [query, setQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [expandedGrades, setExpandedGrades] = useState<Set<GradeKey>>(new Set(GRADE_ORDER));
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pages, setPages] = useState<Record<GradeKey, number>>({ SP: 1, GI: 1, GII: 1, GIII: 1 });

  // Merge all grades into one tagged list
  const allOfficers = useMemo<TaggedOfficer[]>(() => {
    const tag = (data: SeniorityData, grade: GradeKey): TaggedOfficer[] =>
      data.officers.map((o) => ({ ...o, grade, gradeLabel: GRADE_LABELS[grade] }));
    return [
      ...tag(spData, 'SP'),
      ...tag(g1Data, 'GI'),
      ...tag(g2Data, 'GII'),
      ...tag(g3Data, 'GIII'),
    ];
  }, [spData, g1Data, g2Data, g3Data]);

  // Extract unique institutions and roles
  const institutions = useMemo(() => {
    const set = new Set<string>();
    allOfficers.forEach((o) => set.add(o.presentWorkPlace));
    return Array.from(set).sort();
  }, [allOfficers]);

  const roles = useMemo(() => {
    const set = new Set<string>();
    allOfficers.forEach((o) => set.add(o.presentPost));
    return Array.from(set).sort();
  }, [allOfficers]);

  const totalOfficers = allOfficers.length;

  // Suggestions based on mode and query
  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return [];
    const term = query.toLowerCase();
    const source = searchMode === 'institution' ? institutions : roles;
    return source.filter((s) => s.toLowerCase().includes(term)).slice(0, 12);
  }, [query, searchMode, institutions, roles]);

  // Matched officers
  const matched = useMemo<TaggedOfficer[]>(() => {
    if (!selectedItem) return [];
    if (searchMode === 'institution') {
      return allOfficers.filter((o) => o.presentWorkPlace === selectedItem);
    }
    return allOfficers.filter((o) => o.presentPost === selectedItem);
  }, [allOfficers, selectedItem, searchMode]);

  // Group by grade
  const grouped = useMemo(() => {
    const map: Record<GradeKey, TaggedOfficer[]> = { SP: [], GI: [], GII: [], GIII: [] };
    matched.forEach((o) => map[o.grade].push(o));
    // Sort by seniority within each grade
    GRADE_ORDER.forEach((g) => map[g].sort((a, b) => a.currentSeniorityNo - b.currentSeniorityNo));
    return map;
  }, [matched]);

  const handleSelect = (item: string) => {
    setSelectedItem(item);
    setQuery(item);
    setShowSuggestions(false);
    setExpandedGrades(new Set(GRADE_ORDER));
    setPages({ SP: 1, GI: 1, GII: 1, GIII: 1 });
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedItem(null);
    setShowSuggestions(true);
  };

  const handleModeChange = (mode: SearchMode) => {
    setSearchMode(mode);
    setQuery('');
    setSelectedItem(null);
    setShowSuggestions(false);
    setPages({ SP: 1, GI: 1, GII: 1, GIII: 1 });
  };

  const toggleGrade = (g: GradeKey) => {
    setExpandedGrades((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  };

  const nowrap = { whiteSpace: 'nowrap' as const };

  return (
    <div className="margin-vert--lg">
      {/* Stats */}
      <div className="row margin-bottom--lg">
        <div className="col col--3">
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ifm-color-primary)' }}>
              {totalOfficers.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
              Total Officers
            </div>
          </div>
        </div>
        <div className="col col--3">
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: GRADE_COLORS.SP }}>
              {spData.officers.length}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
              Special Grade
            </div>
          </div>
        </div>
        <div className="col col--3">
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: GRADE_COLORS.GI }}>
              {g1Data.officers.length}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
              Grade I
            </div>
          </div>
        </div>
        <div className="col col--3">
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: GRADE_COLORS.GII }}>
              {g2Data.officers.length + g3Data.officers.length}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
              Grade II & III
            </div>
          </div>
        </div>
      </div>

      {/* Search mode toggle */}
      <div className="margin-bottom--md">
        <div className="button-group button-group--block">
          <button
            className={`button ${searchMode === 'institution' ? 'button--primary' : 'button--secondary'}`}
            onClick={() => handleModeChange('institution')}
          >
            Search by Institution ({institutions.length})
          </button>
          <button
            className={`button ${searchMode === 'role' ? 'button--primary' : 'button--secondary'}`}
            onClick={() => handleModeChange('role')}
          >
            Search by Job Role ({roles.length})
          </button>
        </div>
      </div>

      {/* Search input */}
      <div style={{ position: 'relative' }} className="margin-bottom--md">
        <input
          type="text"
          className="button button--outline button--secondary button--block"
          style={{ textAlign: 'left', cursor: 'text' }}
          placeholder={
            searchMode === 'institution'
              ? 'Type a ministry, department, or secretariat name...'
              : 'Type a job role or post title...'
          }
          value={query}
          onChange={handleQueryChange}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 50,
              background: 'var(--ifm-background-surface-color, #ffffff)',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: 6,
              maxHeight: 300,
              overflowY: 'auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              backdropFilter: 'none',
              opacity: 1,
            }}
          >
            {suggestions.map((s) => (
              <div
                key={s}
                className="people-finder-suggestion"
                style={{
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  borderBottom: '1px solid var(--ifm-color-emphasis-200)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--ifm-color-emphasis-200)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
                onMouseDown={() => handleSelect(s)}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {selectedItem && (
        <div>
          <div className="alert alert--success margin-bottom--md">
            <strong>{matched.length}</strong> officer{matched.length !== 1 ? 's' : ''} found at{' '}
            <strong>{selectedItem}</strong>
            <span style={{ marginLeft: 16 }}>
              {GRADE_ORDER.map((g) => (
                <span
                  key={g}
                  className="badge margin-left--sm"
                  style={{
                    background: grouped[g].length > 0 ? GRADE_COLORS[g] : 'var(--ifm-color-emphasis-300)',
                    color: 'white',
                  }}
                >
                  {GRADE_LABELS[g]}: {grouped[g].length}
                </span>
              ))}
            </span>
          </div>

          {/* Grade sections */}
          {GRADE_ORDER.map((g) => {
            const officers = grouped[g];
            if (officers.length === 0) return null;
            const isExpanded = expandedGrades.has(g);
            const page = pages[g];
            const totalPages = Math.ceil(officers.length / ITEMS_PER_PAGE);
            const pageOfficers = officers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

            return (
              <div key={g} className="margin-bottom--lg">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    padding: '10px 0',
                    borderBottom: `3px solid ${GRADE_COLORS[g]}`,
                  }}
                  onClick={() => toggleGrade(g)}
                >
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: GRADE_COLORS[g] }}>
                    {isExpanded ? '\u25BC' : '\u25B6'} {GRADE_LABELS[g]}
                  </span>
                  <span className="badge" style={{ background: GRADE_COLORS[g], color: 'white' }}>
                    {officers.length}
                  </span>
                </div>

                {isExpanded && (
                  <div style={{ overflowX: 'auto' }}>
                    <table
                      className="table table--striped table--hover"
                      style={{ fontSize: '0.85rem', marginTop: 8 }}
                    >
                      <thead>
                        <tr>
                          <th style={nowrap}>Seniority</th>
                          <th>Name</th>
                          <th>Post</th>
                          {searchMode === 'role' && <th>Workplace</th>}
                          <th style={nowrap}>Date of Birth</th>
                          <th style={nowrap}>Entry Gr. III</th>
                          {(g === 'SP' || g === 'GI' || g === 'GII') && (
                            <th style={nowrap}>Prom. Gr. II</th>
                          )}
                          {(g === 'SP' || g === 'GI') && <th style={nowrap}>Prom. Gr. I</th>}
                          {g === 'SP' && <th style={nowrap}>Prom. Sp. Gr.</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {pageOfficers.map((o) => (
                          <tr key={`${g}-${o.serialNo}`}>
                            <td style={nowrap}>{o.currentSeniorityNo}</td>
                            <td style={nowrap}>{o.name}</td>
                            <td>
                              <small>{o.presentPost}</small>
                            </td>
                            {searchMode === 'role' && (
                              <td>
                                <small>{o.presentWorkPlace}</small>
                              </td>
                            )}
                            <td style={nowrap}>
                              <small>{o.dateOfBirth}</small>
                            </td>
                            <td style={nowrap}>
                              <small>{o.dateOfEntryToGradeIII}</small>
                            </td>
                            {(g === 'SP' || g === 'GI' || g === 'GII') && (
                              <td style={nowrap}>
                                <small>{o.dateOfPromotionToGradeII}</small>
                              </td>
                            )}
                            {(g === 'SP' || g === 'GI') && (
                              <td style={nowrap}>
                                <small>{o.dateOfPromotionToGradeI}</small>
                              </td>
                            )}
                            {g === 'SP' && (
                              <td style={nowrap}>
                                <small>{o.dateOfPromotionToGradeSP}</small>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {totalPages > 1 && (
                      <div className="text--center margin-top--sm margin-bottom--sm">
                        <button
                          className="button button--secondary button--sm margin-right--sm"
                          disabled={page === 1}
                          onClick={() => setPages((p) => ({ ...p, [g]: p[g] - 1 }))}
                        >
                          Prev
                        </button>
                        <span style={{ fontSize: '0.85rem' }}>
                          Page {page} of {totalPages}
                        </span>
                        <button
                          className="button button--secondary button--sm margin-left--sm"
                          disabled={page === totalPages}
                          onClick={() => setPages((p) => ({ ...p, [g]: p[g] + 1 }))}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {matched.length === 0 && (
            <div className="text--center margin-vert--xl">
              <p>No officers found for this selection.</p>
            </div>
          )}
        </div>
      )}

      {/* Prompt when no selection */}
      {!selectedItem && query.length < 2 && (
        <div
          className="text--center margin-vert--xl"
          style={{ color: 'var(--ifm-color-emphasis-600)' }}
        >
          <p style={{ fontSize: '1.1rem' }}>
            Start typing to search for{' '}
            {searchMode === 'institution'
              ? 'a ministry, department, or secretariat'
              : 'a job role or post title'}
            .
          </p>
          <p style={{ fontSize: '0.9rem' }}>
            Results will show all officers grouped by grade (Special, I, II, III).
          </p>
        </div>
      )}

      {/* No results for typed query */}
      {!selectedItem && query.length >= 2 && suggestions.length === 0 && (
        <div className="alert alert--warning margin-top--md">
          No matching {searchMode === 'institution' ? 'institutions' : 'roles'} found for "
          {query}".
        </div>
      )}
    </div>
  );
}
