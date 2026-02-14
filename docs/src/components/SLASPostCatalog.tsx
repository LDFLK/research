import React, { useState, useMemo } from 'react';

interface TaxonomyMajor {
  id: string;
  label: string;
  color: string;
  description: string;
}

interface TaxonomyMinor {
  id: string;
  label: string;
  rank: number;
  description: string;
}

interface PostCount {
  total: number;
  SP: number;
  GI: number;
  GII: number;
  GIII: number;
}

interface Post {
  id: string;
  normalizedTitle: string;
  kind: { major: string; minor: string };
  rawVariants: string[];
  count: PostCount;
}

interface Summary {
  totalOfficers: number;
  totalUniqueRawPosts: number;
  totalNormalizedPosts: number;
  byMajor: Record<string, number>;
  byMinor: Record<string, number>;
  byGrade: Record<string, number>;
}

interface CatalogData {
  title: string;
  asAt: string;
  taxonomy: {
    majors: TaxonomyMajor[];
    minors: TaxonomyMinor[];
  };
  posts: Post[];
  summary: Summary;
}

interface Props {
  data: CatalogData;
}

const ITEMS_PER_PAGE = 25;

export default function SLASPostCatalog({ data }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [majorFilter, setMajorFilter] = useState<string>('all');
  const [minorFilter, setMinorFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  const majorColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    data.taxonomy.majors.forEach((m) => {
      map[m.id] = m.color;
    });
    return map;
  }, [data.taxonomy.majors]);

  const majorLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    data.taxonomy.majors.forEach((m) => {
      map[m.id] = m.label;
    });
    return map;
  }, [data.taxonomy.majors]);

  const minorLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    data.taxonomy.minors.forEach((m) => {
      map[m.id] = m.label;
    });
    return map;
  }, [data.taxonomy.minors]);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.posts.filter((p) => {
      if (majorFilter !== 'all' && p.kind.major !== majorFilter) return false;
      if (minorFilter !== 'all' && p.kind.minor !== minorFilter) return false;
      if (term) {
        return (
          p.normalizedTitle.toLowerCase().includes(term) ||
          p.rawVariants.some((v) => v.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [data.posts, searchTerm, majorFilter, minorFilter]);

  const filteredTotal = useMemo(
    () => filtered.reduce((sum, p) => sum + p.count.total, 0),
    [filtered],
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleMajorFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMajorFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleMinorFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMinorFilter(e.target.value);
    setCurrentPage(1);
  };

  const { summary } = data;

  // Sort majors by count for the bar chart
  const sortedMajors = useMemo(() => {
    return data.taxonomy.majors
      .map((m) => ({ ...m, count: summary.byMajor[m.id] || 0 }))
      .sort((a, b) => b.count - a.count);
  }, [data.taxonomy.majors, summary.byMajor]);

  const maxMajorCount = sortedMajors[0]?.count || 1;

  const nowrap = { whiteSpace: 'nowrap' as const };

  return (
    <div className="margin-vert--lg">
      {/* Summary cards */}
      <div className="row margin-bottom--lg">
        <div className="col col--3">
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ifm-color-primary)' }}>
              {summary.totalOfficers.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
              Total Officers
            </div>
          </div>
        </div>
        <div className="col col--3">
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#7C3AED' }}>
              {summary.totalNormalizedPosts}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
              Classified Posts
            </div>
          </div>
        </div>
        <div className="col col--3">
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#059669' }}>
              {summary.totalUniqueRawPosts}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
              Raw Variants
            </div>
          </div>
        </div>
        <div className="col col--3">
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#DB2777' }}>
              {data.taxonomy.majors.length}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
              Major Categories
            </div>
          </div>
        </div>
      </div>

      {/* Grade breakdown */}
      <div className="alert alert--info margin-bottom--md">
        <strong>By Grade:</strong>{' '}
        Special Grade: <strong>{summary.byGrade.SP}</strong> |{' '}
        Grade I: <strong>{summary.byGrade.GI}</strong> |{' '}
        Grade II: <strong>{summary.byGrade.GII}</strong> |{' '}
        Grade III: <strong>{summary.byGrade.GIII}</strong>
        {' '}&mdash; as at <strong>{data.asAt}</strong>
      </div>

      {/* Distribution by major — horizontal bar chart */}
      <h3>Distribution by Role Family</h3>
      <div className="margin-bottom--lg">
        {sortedMajors.map((m) => {
          const pct = ((m.count / summary.totalOfficers) * 100).toFixed(1);
          return (
            <div
              key={m.id}
              className="margin-bottom--sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <div style={{ width: 150, fontSize: '0.85rem', textAlign: 'right' }}>
                {m.label}
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
                    width: `${(m.count / maxMajorCount) * 100}%`,
                    background: m.color,
                    height: '100%',
                    borderRadius: 4,
                    transition: 'width 0.3s ease',
                    minWidth: m.count > 0 ? 2 : 0,
                  }}
                />
              </div>
              <div style={{ width: 80, fontSize: '0.8rem', ...nowrap }}>
                {m.count} ({pct}%)
              </div>
            </div>
          );
        })}
      </div>

      {/* Seniority tier breakdown */}
      <h3>Distribution by Seniority Tier</h3>
      <div className="row margin-bottom--lg">
        {data.taxonomy.minors
          .slice()
          .sort((a, b) => a.rank - b.rank)
          .map((m) => {
            const count = summary.byMinor[m.id] || 0;
            const pct = ((count / summary.totalOfficers) * 100).toFixed(1);
            return (
              <div key={m.id} className="col col--3 margin-bottom--sm">
                <div
                  className="badge badge--secondary"
                  style={{ display: 'block', textAlign: 'center', padding: '0.5rem' }}
                >
                  <div style={{ fontWeight: 600 }}>{m.label}</div>
                  <div>
                    {count} ({pct}%)
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Filters */}
      <h3>Post Catalog</h3>
      <div className="row margin-bottom--md">
        <div className="col col--4">
          <input
            type="text"
            className="button button--outline button--secondary button--block"
            style={{ textAlign: 'left', cursor: 'text' }}
            placeholder="Search posts..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="col col--3">
          <select
            className="button button--outline button--secondary button--block"
            style={{ textAlign: 'left', cursor: 'pointer' }}
            value={majorFilter}
            onChange={handleMajorFilter}
          >
            <option value="all">All Role Families</option>
            {data.taxonomy.majors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col col--3">
          <select
            className="button button--outline button--secondary button--block"
            style={{ textAlign: 'left', cursor: 'pointer' }}
            value={minorFilter}
            onChange={handleMinorFilter}
          >
            <option value="all">All Tiers</option>
            {data.taxonomy.minors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col col--2">
          <div className="badge badge--secondary" style={{ lineHeight: '2.2' }}>
            {filtered.length} posts ({filteredTotal} officers)
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="table table--striped table--hover" style={{ fontSize: '0.85rem' }}>
          <thead>
            <tr>
              <th>Post Title</th>
              <th>Role Family</th>
              <th>Tier</th>
              <th style={nowrap}>Total</th>
              <th style={nowrap}>SP</th>
              <th style={nowrap}>GI</th>
              <th style={nowrap}>GII</th>
              <th style={nowrap}>GIII</th>
              <th style={nowrap}>Variants</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((p) => (
              <React.Fragment key={p.id}>
                <tr
                  style={{ cursor: p.rawVariants.length > 1 ? 'pointer' : 'default' }}
                  onClick={() =>
                    p.rawVariants.length > 1 &&
                    setExpandedPost(expandedPost === p.id ? null : p.id)
                  }
                >
                  <td>
                    <strong>{p.normalizedTitle}</strong>
                    {p.rawVariants.length > 1 && (
                      <span style={{ marginLeft: 6, fontSize: '0.75rem', opacity: 0.6 }}>
                        {expandedPost === p.id ? '▼' : '▶'}
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: majorColorMap[p.kind.major] || '#6B7280',
                        color: '#fff',
                        fontSize: '0.75rem',
                      }}
                    >
                      {majorLabelMap[p.kind.major] || p.kind.major}
                    </span>
                  </td>
                  <td>
                    <small>{minorLabelMap[p.kind.minor] || p.kind.minor}</small>
                  </td>
                  <td style={nowrap}>
                    <strong>{p.count.total}</strong>
                  </td>
                  <td style={nowrap}>{p.count.SP || '–'}</td>
                  <td style={nowrap}>{p.count.GI || '–'}</td>
                  <td style={nowrap}>{p.count.GII || '–'}</td>
                  <td style={nowrap}>{p.count.GIII || '–'}</td>
                  <td style={nowrap}>{p.rawVariants.length}</td>
                </tr>
                {expandedPost === p.id && p.rawVariants.length > 1 && (
                  <tr>
                    <td colSpan={9} style={{ background: 'var(--ifm-color-emphasis-100)', padding: '0.5rem 1rem' }}>
                      <small>
                        <strong>Raw variants:</strong>{' '}
                        {p.rawVariants.map((v, i) => (
                          <span key={i}>
                            <code>{v}</code>
                            {i < p.rawVariants.length - 1 && ', '}
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
          <p>No posts found matching your filters.</p>
        </div>
      )}

      {/* Taxonomy reference */}
      <details className="margin-top--lg">
        <summary>
          <strong>Taxonomy Reference</strong>
        </summary>
        <div className="margin-top--md">
          <h4>Role Families (kind.major)</h4>
          <table className="table table--striped" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>Family</th>
                <th>Description</th>
                <th>Officers</th>
              </tr>
            </thead>
            <tbody>
              {sortedMajors.map((m) => (
                <tr key={m.id}>
                  <td>
                    <span
                      className="badge"
                      style={{ backgroundColor: m.color, color: '#fff' }}
                    >
                      {m.label}
                    </span>
                  </td>
                  <td>{m.description}</td>
                  <td>{m.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h4>Seniority Tiers (kind.minor)</h4>
          <table className="table table--striped" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>Tier</th>
                <th>Rank</th>
                <th>Description</th>
                <th>Officers</th>
              </tr>
            </thead>
            <tbody>
              {data.taxonomy.minors
                .slice()
                .sort((a, b) => a.rank - b.rank)
                .map((m) => (
                  <tr key={m.id}>
                    <td>
                      <strong>{m.label}</strong>
                    </td>
                    <td>{m.rank}</td>
                    <td>{m.description}</td>
                    <td>{summary.byMinor[m.id] || 0}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
