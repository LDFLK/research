import React, { useState, useMemo } from 'react';

interface AgeDistribution {
  overall: Record<string, number>;
  byGrade: Record<string, Record<string, number>>;
  byMajor: Record<string, Record<string, number>>;
}

interface GenderCounts {
  male: number;
  female: number;
  unknown: number;
}

interface GenderDistribution {
  overall: GenderCounts;
  byGrade: Record<string, GenderCounts>;
  byMajor: Record<string, GenderCounts>;
}

interface Stats {
  averageAge: number;
  averageAgeByGrade: Record<string, number>;
  averageAgeByMajor: Record<string, number>;
  medianAge: number;
  youngestAge: number;
  oldestAge: number;
}

interface DemographicsData {
  asAt: string;
  totalOfficers: number;
  ageDistribution: AgeDistribution;
  gender: GenderDistribution;
  stats: Stats;
  ageGradeGender: Record<string, Record<string, GenderCounts>>;
}

interface Props {
  data: DemographicsData;
}

const GRADES = ['SP', 'GI', 'GII', 'GIII'] as const;
const GRADE_LABELS: Record<string, string> = {
  SP: 'Special Grade',
  GI: 'Grade I',
  GII: 'Grade II',
  GIII: 'Grade III',
};

const MAJOR_COLORS: Record<string, string> = {
  Secretariat: '#2563EB',
  Directorate: '#7C3AED',
  FieldAdministration: '#059669',
  Commission: '#DB2777',
  NonActive: '#6B7280',
  Regulatory: '#DC2626',
  Municipal: '#0891B2',
  Provincial: '#D97706',
};

const MAJOR_LABELS: Record<string, string> = {
  Secretariat: 'Secretariat',
  Directorate: 'Directorate',
  FieldAdministration: 'Field Administration',
  Commission: 'Commission',
  NonActive: 'Non-Active',
  Regulatory: 'Regulatory',
  Municipal: 'Municipal',
  Provincial: 'Provincial',
};

const GRADE_COLORS: Record<string, string> = {
  SP: '#DC2626',
  GI: '#2563EB',
  GII: '#059669',
  GIII: '#D97706',
};

type ViewMode = 'all' | 'SP' | 'GI' | 'GII' | 'GIII';

export default function SLASDemographics({ data }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('all');

  const ageBuckets = useMemo(() => {
    const src = viewMode === 'all'
      ? data.ageDistribution.overall
      : data.ageDistribution.byGrade[viewMode] || {};
    return Object.entries(src).sort(([a], [b]) => {
      const numA = parseInt(a) || 0;
      const numB = parseInt(b) || 0;
      return numA - numB;
    });
  }, [data, viewMode]);

  const maxBucketCount = useMemo(
    () => Math.max(...ageBuckets.map(([, v]) => v), 1),
    [ageBuckets],
  );

  const genderData = useMemo(() => {
    return viewMode === 'all'
      ? data.gender.overall
      : data.gender.byGrade[viewMode] || { male: 0, female: 0, unknown: 0 };
  }, [data, viewMode]);

  const genderTotal = genderData.male + genderData.female + genderData.unknown;

  const avgAge = viewMode === 'all'
    ? data.stats.averageAge
    : data.stats.averageAgeByGrade[viewMode] || 0;

  const nowrap = { whiteSpace: 'nowrap' as const };

  return (
    <div className="margin-vert--lg">
      {/* Summary cards */}
      <div className="row margin-bottom--lg">
        <div className="col col--3">
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ifm-color-primary)' }}>
              {data.totalOfficers.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
              Total Officers
            </div>
          </div>
        </div>
        <div className="col col--3">
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#7C3AED' }}>
              {avgAge}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
              Average Age
            </div>
          </div>
        </div>
        <div className="col col--3">
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#059669' }}>
              {data.stats.youngestAge}–{data.stats.oldestAge}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
              Age Range
            </div>
          </div>
        </div>
        <div className="col col--3">
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#DB2777' }}>
              {((genderData.female / genderTotal) * 100).toFixed(0)}%
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
              Female Officers
            </div>
          </div>
        </div>
      </div>

      {/* Grade breakdown */}
      <div className="alert alert--info margin-bottom--md">
        <strong>By Grade:</strong>{' '}
        {GRADES.map((g) => (
          <span key={g}>
            {GRADE_LABELS[g]}: <strong>{(data.ageDistribution.byGrade[g] ? Object.values(data.ageDistribution.byGrade[g]).reduce((a, b) => a + b, 0) : 0)}</strong>
            {g !== 'GIII' && ' | '}
          </span>
        ))}
        {' '}&mdash; as at <strong>{data.asAt}</strong>
      </div>

      {/* Grade filter */}
      <h3>Age Distribution</h3>
      <div className="margin-bottom--md">
        {(['all', ...GRADES] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            className={`button button--sm margin-right--sm ${viewMode === mode ? 'button--primary' : 'button--outline button--secondary'}`}
            onClick={() => setViewMode(mode)}
          >
            {mode === 'all' ? 'All Grades' : GRADE_LABELS[mode]}
          </button>
        ))}
      </div>

      {/* Age distribution bar chart */}
      <div className="margin-bottom--lg">
        {ageBuckets.map(([bucket, count]) => {
          const pct = ((count / data.totalOfficers) * 100).toFixed(1);
          return (
            <div
              key={bucket}
              className="margin-bottom--sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <div style={{ width: 80, fontSize: '0.85rem', textAlign: 'right', ...nowrap }}>
                {bucket}
              </div>
              <div
                style={{
                  flex: 1,
                  background: 'var(--ifm-color-emphasis-200)',
                  borderRadius: 4,
                  height: 28,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${(count / maxBucketCount) * 100}%`,
                    background: viewMode === 'all'
                      ? 'var(--ifm-color-primary)'
                      : GRADE_COLORS[viewMode] || 'var(--ifm-color-primary)',
                    height: '100%',
                    borderRadius: 4,
                    transition: 'width 0.3s ease',
                    minWidth: count > 0 ? 2 : 0,
                  }}
                />
              </div>
              <div style={{ width: 90, fontSize: '0.8rem', ...nowrap }}>
                {count} ({pct}%)
              </div>
            </div>
          );
        })}
      </div>

      {/* Gender breakdown */}
      <h3>Gender Distribution</h3>
      <div className="margin-bottom--lg">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <div
            className="badge"
            style={{ backgroundColor: '#2563EB', color: '#fff', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            Male: {genderData.male} ({((genderData.male / genderTotal) * 100).toFixed(1)}%)
          </div>
          <div
            className="badge"
            style={{ backgroundColor: '#DB2777', color: '#fff', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            Female: {genderData.female} ({((genderData.female / genderTotal) * 100).toFixed(1)}%)
          </div>
          {genderData.unknown > 0 && (
            <div
              className="badge badge--secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              Unknown: {genderData.unknown}
            </div>
          )}
        </div>

        {/* Gender bar */}
        <div
          style={{
            display: 'flex',
            height: 28,
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div style={{ width: `${(genderData.male / genderTotal) * 100}%`, background: '#2563EB', transition: 'width 0.3s ease' }} />
          <div style={{ width: `${(genderData.female / genderTotal) * 100}%`, background: '#DB2777', transition: 'width 0.3s ease' }} />
          {genderData.unknown > 0 && (
            <div style={{ width: `${(genderData.unknown / genderTotal) * 100}%`, background: '#6B7280' }} />
          )}
        </div>
      </div>

      {/* Gender by grade table */}
      <h3>Gender by Grade</h3>
      <div style={{ overflowX: 'auto' }} className="margin-bottom--lg">
        <table className="table table--striped table--hover" style={{ fontSize: '0.85rem' }}>
          <thead>
            <tr>
              <th>Grade</th>
              <th style={nowrap}>Male</th>
              <th style={nowrap}>Female</th>
              <th style={nowrap}>Unknown</th>
              <th style={nowrap}>Total</th>
              <th style={nowrap}>% Female</th>
            </tr>
          </thead>
          <tbody>
            {GRADES.map((g) => {
              const gd = data.gender.byGrade[g] || { male: 0, female: 0, unknown: 0 };
              const total = gd.male + gd.female + gd.unknown;
              return (
                <tr key={g}>
                  <td><strong>{GRADE_LABELS[g]}</strong></td>
                  <td>{gd.male}</td>
                  <td>{gd.female}</td>
                  <td>{gd.unknown || '–'}</td>
                  <td><strong>{total}</strong></td>
                  <td>{total > 0 ? ((gd.female / total) * 100).toFixed(1) + '%' : '–'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Average age by grade */}
      <h3>Average Age by Grade</h3>
      <div className="margin-bottom--lg">
        {GRADES.map((g) => {
          const age = data.stats.averageAgeByGrade[g];
          const maxAge = Math.max(...Object.values(data.stats.averageAgeByGrade));
          return (
            <div
              key={g}
              className="margin-bottom--sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <div style={{ width: 120, fontSize: '0.85rem', textAlign: 'right' }}>
                {GRADE_LABELS[g]}
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
                    width: `${(age / maxAge) * 100}%`,
                    background: GRADE_COLORS[g],
                    height: '100%',
                    borderRadius: 4,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div style={{ width: 80, fontSize: '0.8rem', ...nowrap }}>
                {age} years
              </div>
            </div>
          );
        })}
      </div>

      {/* Age × Role Family cross-tab */}
      <h3>Age Distribution by Role Family</h3>
      <div style={{ overflowX: 'auto' }} className="margin-bottom--lg">
        <table className="table table--striped table--hover" style={{ fontSize: '0.8rem' }}>
          <thead>
            <tr>
              <th>Role Family</th>
              {Object.keys(data.ageDistribution.overall).map((b) => (
                <th key={b} style={{ ...nowrap, textAlign: 'center' }}>{b}</th>
              ))}
              <th style={nowrap}>Avg Age</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.ageDistribution.byMajor)
              .sort(([, a], [, b]) => {
                const totalA = Object.values(a).reduce((s, v) => s + v, 0);
                const totalB = Object.values(b).reduce((s, v) => s + v, 0);
                return totalB - totalA;
              })
              .map(([major, buckets]) => (
                <tr key={major}>
                  <td>
                    <span
                      className="badge"
                      style={{ backgroundColor: MAJOR_COLORS[major] || '#6B7280', color: '#fff', fontSize: '0.75rem' }}
                    >
                      {MAJOR_LABELS[major] || major}
                    </span>
                  </td>
                  {Object.keys(data.ageDistribution.overall).map((b) => (
                    <td key={b} style={{ textAlign: 'center' }}>
                      {buckets[b] || '–'}
                    </td>
                  ))}
                  <td style={nowrap}>
                    <strong>{data.stats.averageAgeByMajor[major] || '–'}</strong>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
