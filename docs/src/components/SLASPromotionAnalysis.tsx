import React, { useState, useMemo } from 'react';

interface SpanStats {
  count: number;
  avgYears: number;
  medianYears: number;
  minYears: number;
  maxYears: number;
  distribution: Record<string, number>;
}

interface CohortSpan {
  count: number;
  avgYears: number;
  medianYears: number;
}

interface FastestOfficer {
  name: string;
  entryYear: number;
  spYear: number;
  totalYears: number;
}

interface GradeTimeStats {
  count: number;
  avgYears: number;
  medianYears: number;
  distribution: Record<string, number>;
}

interface PromotionData {
  asAt: string;
  totalOfficers: number;
  spans: {
    gradeIIIToII: SpanStats | null;
    gradeIIToI: SpanStats | null;
    gradeIToSP: SpanStats | null;
    entryToSP: SpanStats | null;
  };
  byCohort: Record<string, Record<string, CohortSpan>>;
  fastestToSP: FastestOfficer[];
  currentGradeTimeDistribution: Record<string, GradeTimeStats>;
}

interface Props {
  data: PromotionData;
}

const SPAN_LABELS: Record<string, string> = {
  gradeIIIToII: 'Grade III \u2192 Grade II',
  gradeIIToI: 'Grade II \u2192 Grade I',
  gradeIToSP: 'Grade I \u2192 Special Grade',
  entryToSP: 'Entry \u2192 Special Grade (Total)',
};

const SPAN_COLORS: Record<string, string> = {
  gradeIIIToII: '#D97706',
  gradeIIToI: '#059669',
  gradeIToSP: '#2563EB',
  entryToSP: '#DC2626',
};

const GRADE_LABELS: Record<string, string> = {
  SP: 'Special Grade',
  GI: 'Grade I',
  GII: 'Grade II',
  GIII: 'Grade III',
};

const GRADE_COLORS: Record<string, string> = {
  SP: '#DC2626',
  GI: '#2563EB',
  GII: '#059669',
  GIII: '#D97706',
};

type SpanView = 'gradeIIIToII' | 'gradeIIToI' | 'gradeIToSP' | 'entryToSP';

export default function SLASPromotionAnalysis({ data }: Props) {
  const [selectedSpan, setSelectedSpan] = useState<SpanView>('gradeIIIToII');

  const currentSpan = data.spans[selectedSpan];
  const currentDist = currentSpan?.distribution || {};

  const distEntries = useMemo(() => {
    return Object.entries(currentDist).sort(([a], [b]) => {
      const numA = a.startsWith('<') ? 0 : parseInt(a);
      const numB = b.startsWith('<') ? 0 : parseInt(b);
      return numA - numB;
    });
  }, [currentDist]);

  const maxDistCount = useMemo(
    () => Math.max(...distEntries.map(([, v]) => v), 1),
    [distEntries],
  );

  // Cohort data for the selected span
  const cohortEntries = useMemo(() => {
    return Object.entries(data.byCohort)
      .filter(([, spans]) => spans[selectedSpan])
      .sort(([a], [b]) => a.localeCompare(b));
  }, [data.byCohort, selectedSpan]);

  const nowrap = { whiteSpace: 'nowrap' as const };

  return (
    <div className="margin-vert--lg">
      {/* Summary cards */}
      <div className="row margin-bottom--lg">
        {Object.entries(data.spans).map(([key, span]) => {
          if (!span) return null;
          return (
            <div key={key} className="col col--3">
              <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: SPAN_COLORS[key] }}>
                  {span.avgYears}y
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)' }}>
                  {SPAN_LABELS[key]}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--ifm-color-emphasis-500)' }}>
                  ({span.count} officers)
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="alert alert--info margin-bottom--md">
        <strong>Data Coverage:</strong>{' '}
        GIII\u2192GII spans available for <strong>{data.spans.gradeIIIToII?.count || 0}</strong> officers (SP + GI + GII);{' '}
        GII\u2192GI for <strong>{data.spans.gradeIIToI?.count || 0}</strong> (SP + GI);{' '}
        GI\u2192SP for <strong>{data.spans.gradeIToSP?.count || 0}</strong> (SP only).
        &mdash; as at <strong>{data.asAt}</strong>
      </div>

      {/* Span selector */}
      <h3>Promotion Time Distribution</h3>
      <div className="margin-bottom--md">
        {(Object.keys(SPAN_LABELS) as SpanView[]).map((key) => (
          <button
            key={key}
            className={`button button--sm margin-right--sm margin-bottom--sm ${selectedSpan === key ? 'button--primary' : 'button--outline button--secondary'}`}
            onClick={() => setSelectedSpan(key)}
          >
            {SPAN_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Distribution bar chart */}
      {currentSpan && (
        <div className="margin-bottom--lg">
          <div className="margin-bottom--sm" style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
            Avg: <strong>{currentSpan.avgYears}y</strong> | Median: <strong>{currentSpan.medianYears}y</strong> | Range: {currentSpan.minYears}y–{currentSpan.maxYears}y
          </div>
          {distEntries.map(([bucket, count]) => {
            const pct = ((count / currentSpan.count) * 100).toFixed(1);
            return (
              <div
                key={bucket}
                className="margin-bottom--sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <div style={{ width: 80, fontSize: '0.85rem', textAlign: 'right', ...nowrap }}>
                  {bucket}y
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
                      width: `${(count / maxDistCount) * 100}%`,
                      background: SPAN_COLORS[selectedSpan],
                      height: '100%',
                      borderRadius: 4,
                      transition: 'width 0.3s ease',
                      minWidth: count > 0 ? 2 : 0,
                    }}
                  />
                </div>
                <div style={{ width: 100, fontSize: '0.8rem', ...nowrap }}>
                  {count} ({pct}%)
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cohort trends */}
      <h3>Promotion Speed by Entry Cohort</h3>
      <div style={{ overflowX: 'auto' }} className="margin-bottom--lg">
        <table className="table table--striped table--hover" style={{ fontSize: '0.85rem' }}>
          <thead>
            <tr>
              <th>Entry Cohort</th>
              <th style={nowrap}>Officers</th>
              <th style={nowrap}>Avg Years</th>
              <th style={nowrap}>Median Years</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {cohortEntries.map(([cohort, spans]) => {
              const s = spans[selectedSpan];
              if (!s) return null;
              const maxAvg = Math.max(...cohortEntries.map(([, sp]) => sp[selectedSpan]?.avgYears || 0));
              return (
                <tr key={cohort}>
                  <td><strong>{cohort}</strong></td>
                  <td>{s.count}</td>
                  <td>{s.avgYears}y</td>
                  <td>{s.medianYears}y</td>
                  <td style={{ width: '40%' }}>
                    <div
                      style={{
                        background: 'var(--ifm-color-emphasis-200)',
                        borderRadius: 4,
                        height: 16,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: maxAvg > 0 ? `${(s.avgYears / maxAvg) * 100}%` : '0%',
                          background: SPAN_COLORS[selectedSpan],
                          height: '100%',
                          borderRadius: 4,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Fastest to SP */}
      {data.fastestToSP.length > 0 && (
        <>
          <h3>Fastest Promotions to Special Grade</h3>
          <div style={{ overflowX: 'auto' }} className="margin-bottom--lg">
            <table className="table table--striped table--hover" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th style={nowrap}>Entry Year</th>
                  <th style={nowrap}>SP Year</th>
                  <th style={nowrap}>Total Years</th>
                </tr>
              </thead>
              <tbody>
                {data.fastestToSP.map((o, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td><strong>{o.name}</strong></td>
                    <td>{o.entryYear}</td>
                    <td>{o.spYear}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: SPAN_COLORS.entryToSP,
                          color: '#fff',
                          fontSize: '0.8rem',
                        }}
                      >
                        {o.totalYears}y
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Time in current grade */}
      <h3>Time in Current Grade</h3>
      <div className="margin-bottom--lg">
        <div className="row">
          {(['SP', 'GI', 'GII', 'GIII'] as const).map((g) => {
            const stats = data.currentGradeTimeDistribution[g];
            if (!stats) return null;
            return (
              <div key={g} className="col col--3">
                <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: GRADE_COLORS[g] }}>
                    {GRADE_LABELS[g]}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    {stats.avgYears}y
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-500)' }}>
                    avg ({stats.count} officers)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-500)' }}>
                    median: {stats.medianYears}y
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
