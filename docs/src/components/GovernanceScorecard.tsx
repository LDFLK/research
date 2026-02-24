import React, { useState, useMemo } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useBaseUrl from '@docusaurus/useBaseUrl';
import scorecard from '../data/governance-scorecard.json';
import styles from './GovernanceScorecard.module.css';

type TabKey = 'dashboard' | 'scores' | 'alerts' | 'methodology';

const TAB_LABELS: Record<TabKey, string> = {
  dashboard: 'Dashboard',
  scores: 'Act Scores',
  alerts: 'Alerts',
  methodology: 'Methodology',
};

const GRADE_CLASS: Record<string, string> = {
  A: 'gradeA',
  B: 'gradeB',
  C: 'gradeC',
  D: 'gradeD',
  F: 'gradeF',
};

const GRADE_COLORS: Record<string, string> = {
  A: '#16a34a',
  B: '#2563eb',
  C: '#d97706',
  D: '#ea580c',
  F: '#dc2626',
};

const STATUS_CLASS: Record<string, string> = {
  active: 'statusActive',
  unknown: 'statusUnknown',
  superseded: 'statusSuperseded',
};

const ALERT_SEVERITY_CLASS: Record<string, string> = {
  critical: 'alertCritical',
  warning: 'alertWarning',
  info: 'alertInfo',
};

const SEVERITY_BADGE_CLASS: Record<string, string> = {
  critical: 'severityCritical',
  warning: 'severityWarning',
  info: 'severityInfo',
};

const ALERT_LABELS: Record<string, string> = {
  'governance-void': 'Governance Void',
  'power-dormancy': 'Power Dormancy',
  'structural-gap': 'Structural Gap',
};

// ===== Sub-components =====

function GradeBadge({
  grade,
  size = 'normal',
}: {
  grade: string;
  size?: 'small' | 'normal' | 'large';
}) {
  const sizeClass =
    size === 'large'
      ? styles.gradeBadgeLarge
      : size === 'small'
        ? styles.gradeBadgeSmall
        : '';
  return (
    <span
      className={`${styles.gradeBadge} ${sizeClass} ${styles[GRADE_CLASS[grade] || 'gradeF']}`}
    >
      {grade}
    </span>
  );
}

function DisclaimerBanner() {
  return (
    <div className={styles.disclaimerBanner}>
      <strong>Alpha Research — AI-Generated Analysis</strong>
      This scorecard is a research prototype. Scores, grades, and alerts were
      generated using AI analysis of legislative texts. The data has not been
      independently verified. Do not use for policy, legal, or administrative
      decisions. The Lanka Data Foundation accepts no responsibility for any
      actions taken based on this analysis.
    </div>
  );
}

function MinistryHero() {
  const m = scorecard.ministry;
  return (
    <div className={styles.ministryHero}>
      <div className={styles.ministryTitle}>
        {scorecard.metadata.ministry} — Governance Compliance Score
      </div>
      <div className={styles.heroStats}>
        <div className={styles.heroStat}>
          <div className={styles.heroStatValue} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {m.gcs.toFixed(2)} <GradeBadge grade={m.grade} size="small" />
          </div>
          <div className={styles.heroStatLabel}>GCS</div>
        </div>
        <div className={styles.heroStat}>
          <div className={styles.heroStatValue}>{m.totalActs}</div>
          <div className={styles.heroStatLabel}>Acts</div>
        </div>
        <div className={styles.heroStat}>
          <div className={styles.heroStatValue}>{m.totalBodies}</div>
          <div className={styles.heroStatLabel}>Bodies</div>
        </div>
        <div className={styles.heroStat}>
          <div className={styles.heroStatValue}>{m.activeBodies}</div>
          <div className={styles.heroStatLabel}>Active</div>
        </div>
        <div className={styles.heroStat}>
          <div className={styles.heroStatValue}>{m.totalPowers}</div>
          <div className={styles.heroStatLabel}>Powers</div>
        </div>
      </div>
    </div>
  );
}

function BarChartInner() {
  const recharts = require('recharts');
  const {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
  } = recharts;

  const data = scorecard.acts.map((a) => ({
    name: a.title.length > 25 ? a.title.slice(0, 22) + '...' : a.title,
    fullName: a.title,
    gcs: a.gcs,
    grade: a.grade,
    year: a.year,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 10, right: 10, bottom: 80, left: 10 }}>
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={80}
          tick={{ fill: 'var(--ifm-font-color-base)', fontSize: 10 }}
          interval={0}
        />
        <YAxis
          domain={[0, 1]}
          tick={{ fill: 'var(--ifm-font-color-base)', fontSize: 11 }}
          tickFormatter={(v: number) => v.toFixed(1)}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--ifm-background-color)',
            border: '1px solid var(--ifm-color-emphasis-300)',
            borderRadius: 8,
            fontSize: '0.85em',
          }}
          formatter={(value: number, _name: string, props: { payload: { fullName: string; grade: string; year: number } }) => [
            `${value.toFixed(3)} (Grade ${props.payload.grade})`,
            `${props.payload.fullName} (${props.payload.year})`,
          ]}
        />
        <Bar dataKey="gcs" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={GRADE_COLORS[entry.grade] || GRADE_COLORS.F} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function DashboardTab() {
  const gradeCounts = useMemo(() => {
    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    for (const act of scorecard.acts) {
      counts[act.grade] = (counts[act.grade] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <div>
      <div className={styles.chartContainer}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '1em', fontWeight: 600 }}>
          GCS by Act
        </h4>
        <BrowserOnly
          fallback={<div className={styles.chartPlaceholder}>Loading chart...</div>}
        >
          {() => <BarChartInner />}
        </BrowserOnly>
      </div>
      <div className={styles.gradeDistribution}>
        {(['A', 'B', 'C', 'D', 'F'] as const).map((g) => (
          <div key={g} className={styles.gradeChip}>
            <GradeBadge grade={g} size="small" />
            <span>{gradeCounts[g]} act{gradeCounts[g] !== 1 ? 's' : ''}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BodyScoreRow({ body }: { body: (typeof scorecard.acts)[0]['bodies'][0] }) {
  const statusCls = STATUS_CLASS[body.operationalStatus] || '';
  return (
    <div className={styles.bodyRow}>
      <span className={styles.bodyRowName}>{body.name}</span>
      <span className={styles.bodyRowCat}>{body.category} ({body.categoryWeight})</span>
      <div className={styles.bodyRowMeta}>
        <span>IVS: <strong>{body.ivs.toFixed(2)}</strong></span>
        <span>DGQ: <strong>{body.dgq.toFixed(2)}</strong></span>
        <span>Powers: <strong>{body.powersCount}</strong></span>
        <span className={statusCls}>{body.operationalStatus}</span>
        {body.dormancyPenalty < 0 && (
          <span className={styles.dormancyBadge}>{body.dormancyPenalty.toFixed(2)}</span>
        )}
      </div>
    </div>
  );
}

function ActScoreCard({
  act,
  expanded,
  onToggle,
}: {
  act: (typeof scorecard.acts)[0];
  expanded: boolean;
  onToggle: () => void;
}) {
  const auditUrl = useBaseUrl(`/docs/governance-scorecard/audit#${act.actId}`);
  return (
    <div
      className={styles.actCard}
      style={{ borderLeftColor: act.domainColor }}
      onClick={onToggle}
    >
      <div className={styles.actCardHeader}>
        <GradeBadge grade={act.grade} />
        <span className={styles.actCardTitle}>{act.title}</span>
        <span className={styles.actCardYear}>({act.year})</span>
        <span className={styles.actCardGCS}>{act.gcs.toFixed(3)}</span>
      </div>
      <div className={styles.dimensionRow}>
        <span className={styles.dimensionItem}>
          <span className={styles.dimensionLabel}>MCS:</span>
          <span className={styles.dimensionValue}>{act.mcs.toFixed(2)}</span>
        </span>
        <span className={styles.dimensionItem}>
          <span className={styles.dimensionLabel}>IVS:</span>
          <span className={styles.dimensionValue}>{act.ivs.toFixed(2)}</span>
        </span>
        <span className={styles.dimensionItem}>
          <span className={styles.dimensionLabel}>DGQ:</span>
          <span className={styles.dimensionValue}>{act.dgq.toFixed(2)}</span>
        </span>
        <span className={styles.dimensionItem}>
          <span className={styles.dimensionLabel}>PDI:</span>
          <span className={styles.dimensionValue}>{act.pdi.toFixed(2)}</span>
        </span>
        <span className={styles.dimensionItem}>
          <span className={styles.dimensionLabel}>DCM:</span>
          <span className={styles.dimensionValue}>{act.dcm.toFixed(1)}</span>
        </span>
      </div>
      <div className={styles.dimensionRow} style={{ marginTop: 6 }}>
        <a
          href={auditUrl}
          className={styles.auditLink}
          onClick={(e) => e.stopPropagation()}
        >
          View score calculation →
        </a>
      </div>
      {act.bodies.length > 0 && !expanded && (
        <div className={styles.expandHint}>
          &#9654; {act.bodies.length} {act.bodies.length === 1 ? 'body' : 'bodies'} — click to expand
        </div>
      )}
      {act.bodies.length === 0 && (
        <div className={styles.expandHint}>No statutory bodies established</div>
      )}
      {expanded && act.bodies.length > 0 && (
        <div className={styles.bodiesExpanded}>
          {act.bodies.map((b) => (
            <BodyScoreRow key={b.name} body={b} />
          ))}
        </div>
      )}
    </div>
  );
}

function ActScoresTab() {
  const [domainFilter, setDomainFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedAct, setExpandedAct] = useState<string | null>(null);

  const domains = useMemo(() => {
    const set = new Set(scorecard.acts.map((a) => a.domainLabel));
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    return scorecard.acts.filter((a) => {
      if (domainFilter !== 'all' && a.domainLabel !== domainFilter) return false;
      if (gradeFilter !== 'all' && a.grade !== gradeFilter) return false;
      if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [domainFilter, gradeFilter, search]);

  return (
    <div>
      <div className={styles.filterBar}>
        <select
          className={styles.filterSelect}
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
        >
          <option value="all">All Domains</option>
          {domains.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
        >
          <option value="all">All Grades</option>
          {['A', 'B', 'C', 'D', 'F'].map((g) => (
            <option key={g} value={g}>Grade {g}</option>
          ))}
        </select>
        <input
          className={styles.filterSearch}
          type="text"
          placeholder="Search acts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {filtered.length === 0 && (
        <div className={styles.emptyState}>No acts match the current filters.</div>
      )}
      {filtered.map((act) => (
        <ActScoreCard
          key={act.actId}
          act={act}
          expanded={expandedAct === act.actId}
          onToggle={() =>
            setExpandedAct(expandedAct === act.actId ? null : act.actId)
          }
        />
      ))}
    </div>
  );
}

function AlertsTab() {
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return scorecard.alerts;
    return scorecard.alerts.filter((a) => a.severity === filter);
  }, [filter]);

  const counts = useMemo(() => {
    const c = { critical: 0, warning: 0, info: 0 };
    for (const a of scorecard.alerts) {
      c[a.severity as keyof typeof c] = (c[a.severity as keyof typeof c] || 0) + 1;
    }
    return c;
  }, []);

  return (
    <div>
      <div className={styles.filterBar}>
        <select
          className={styles.filterSelect}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All ({scorecard.alerts.length})</option>
          <option value="critical">Critical ({counts.critical})</option>
          <option value="warning">Warning ({counts.warning})</option>
          <option value="info">Info ({counts.info})</option>
        </select>
      </div>
      {filtered.length === 0 && (
        <div className={styles.emptyState}>No alerts match the current filter.</div>
      )}
      {filtered.map((alert, i) => (
        <div
          key={i}
          className={`${styles.alertCard} ${styles[ALERT_SEVERITY_CLASS[alert.severity] || '']}`}
        >
          <div className={styles.alertHeader}>
            <span className={styles.alertType}>
              {ALERT_LABELS[alert.type] || alert.type}
            </span>
            <span
              className={`${styles.alertSeverity} ${styles[SEVERITY_BADGE_CLASS[alert.severity] || '']}`}
            >
              {alert.severity}
            </span>
          </div>
          <div className={styles.alertAct}>{alert.actTitle}</div>
          {alert.bodyName !== '(none)' && (
            <div className={styles.alertBody}>{alert.bodyName}</div>
          )}
          <div className={styles.alertDesc}>{alert.description}</div>
        </div>
      ))}
    </div>
  );
}

function MethodologyTab() {
  const m = scorecard.metadata.methodology;
  return (
    <div>
      <div className={styles.methodologySection}>
        <h3 className={styles.methodologyTitle}>The Mandate-Action-Outcome Triad</h3>
        <p className={styles.methodologyText}>
          The Governance Compliance Score (GCS) evaluates how well Sri Lankan legislative
          mandates are operationalized through institutional bodies, meetings, and powers.
          It is based on the <strong>Mandate-Action-Outcome triad</strong>: legislation
          creates mandates (M), institutions take actions (A) to implement them, and
          governance quality determines outcomes (O). The GCS captures the gap between
          what the law requires and what institutional structures actually deliver.
        </p>
      </div>

      <div className={styles.methodologySection}>
        <h3 className={styles.methodologyTitle}>Composite Formula</h3>
        <div className={styles.formulaBlock}>{m.formula}</div>
        <p className={styles.methodologyText}>
          Where MCS = Mandate Completeness Score, IVS = Institutional Vitality Score
          (body-weighted average), DGQ = Decision Governance Quality (body-weighted average),
          PDI = Power Dormancy Index (penalty), and DCM = Data Confidence Modifier (0.4-1.0 scaling).
        </p>
      </div>

      <div className={styles.methodologySection}>
        <h3 className={styles.methodologyTitle}>Five Dimensions</h3>
        <table className={styles.methodTable}>
          <thead>
            <tr>
              <th>Dimension</th>
              <th>Weight</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {m.dimensions.map((d) => (
              <tr key={d.name}>
                <td><strong>{d.name}</strong></td>
                <td>{d.weight != null ? (d.weight * 100).toFixed(0) + '%' : 'Modifier'}</td>
                <td>{d.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.methodologySection}>
        <h3 className={styles.methodologyTitle}>Body Category Weights</h3>
        <table className={styles.methodTable}>
          <thead>
            <tr>
              <th>Category</th>
              <th>Weight</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {m.bodyWeights.map((b) => (
              <tr key={b.category}>
                <td><strong>{b.category}</strong></td>
                <td>{(b.weight * 100).toFixed(0)}%</td>
                <td>{b.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.methodologySection}>
        <h3 className={styles.methodologyTitle}>Grading Scale</h3>
        <table className={styles.methodTable}>
          <thead>
            <tr>
              <th>Grade</th>
              <th>Range</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            {m.gradingScale.map((g) => (
              <tr key={g.grade}>
                <td>
                  <GradeBadge grade={g.grade} size="small" />
                </td>
                <td>{g.range}</td>
                <td>{g.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.methodologySection}>
        <h3 className={styles.methodologyTitle}>Data Sources</h3>
        <p className={styles.methodologyText}>
          Scores are computed from three pre-existing data files in this research repository:
        </p>
        <ul className={styles.methodologyText}>
          <li>
            <strong>act-anatomy-profiles.json</strong> — 18 act profiles with statutory body
            inventories, functional profiles, governance hierarchies, and data confidence ratings.
          </li>
          <li>
            <strong>ministry-health-meetings.json</strong> — Meeting governance data for 26
            statutory bodies: frequency, quorum, reporting, dissent mechanisms, and chair type.
          </li>
          <li>
            <strong>12 deep-dive analysis JSON files</strong> — Detailed AI-generated analysis
            providing cross-references, amendment histories, and operational status assessments.
          </li>
        </ul>
      </div>

      <div className={styles.methodologySection}>
        <h3 className={styles.methodologyTitle}>Limitations</h3>
        <ul className={styles.methodologyText}>
          <li>
            <strong>Operational status gaps:</strong> Many bodies have &ldquo;unknown&rdquo;
            operational status because verification requires field research beyond legislative
            text analysis.
          </li>
          <li>
            <strong>No actual meeting frequency data:</strong> Scores reflect what the law
            mandates, not whether meetings actually occur at prescribed frequencies.
          </li>
          <li>
            <strong>AI-generated classifications:</strong> Body category assignments and
            composition diversity assessments are heuristic-based and may contain errors.
          </li>
          <li>
            <strong>Single ministry scope:</strong> Currently covers Ministry of Health only.
            Cross-ministry comparisons are not yet possible.
          </li>
          <li>
            <strong>No macro governance indicators:</strong> Does not incorporate external
            indicators like budget execution, audit findings, or citizen satisfaction.
          </li>
        </ul>
      </div>

      <div className={styles.methodologySection}>
        <h3 className={styles.methodologyTitle}>Credits &amp; Version</h3>
        <p className={styles.methodologyText}>
          AI-generated with human advisory input. Based on research by the Lanka Data Foundation.
          <br />
          Model version: <strong>{scorecard.metadata.modelVersion}</strong>
          {' '}&middot;{' '}
          Data version: <strong>{scorecard.metadata.version}</strong>
          {' '}&middot;{' '}
          Generated: <strong>{scorecard.metadata.generatedDate}</strong>
        </p>
      </div>
    </div>
  );
}

// ===== Main Component =====

export default function GovernanceScorecard() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  return (
    <div className={styles.scorecard}>
      <DisclaimerBanner />
      <MinistryHero />

      <div className={styles.tabBar}>
        {(Object.keys(TAB_LABELS) as TabKey[]).map((tab) => (
          <button
            key={tab}
            className={`button button--sm ${
              activeTab === tab
                ? 'button--primary'
                : 'button--outline button--secondary'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {TAB_LABELS[tab]}
            {tab === 'alerts' && scorecard.alerts.length > 0 && (
              <span className={styles.alertCount}>{scorecard.alerts.length}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'scores' && <ActScoresTab />}
      {activeTab === 'alerts' && <AlertsTab />}
      {activeTab === 'methodology' && <MethodologyTab />}
    </div>
  );
}
