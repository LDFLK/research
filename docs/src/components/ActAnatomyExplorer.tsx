import React, { useState, useMemo, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import profiles from '../data/act-anatomy-profiles.json';
import styles from './ActAnatomyExplorer.module.css';

type TabKey = 'overview' | 'bodies' | 'timeline' | 'governance';

interface Profile {
  id: string;
  title: string;
  number: string;
  year: number;
  kind: { major: string; minor: string };
  status: string;
  domainCategory: string;
  domainColor: string;
  domainLabel: string;
  pdfUrl: string;
  summary: string;
  repealedBy?: { actNumber: string; year: number; title: string };
  functionalProfile: Record<string, number>;
  statutoryBodies: {
    name: string; sections: string;
    currentStatus: string; operationalStatus: string;
    maxMembers: number | null; powersCount: number;
  }[];
  amendments: { actNumber: string; year: number; impactRating: string; summary: string }[];
  timeline: { year: number; event: string; type: string }[];
  governanceHierarchy: { tiers: { level: number; name: string; status: string }[] };
  dataConfidence: { legislativeFramework: string; historicalDetails: string; currentOperationalStatus: string };
  crossReferences: { id: string; title: string }[];
  stats: {
    bodiesCount: number; activeBodiesCount: number;
    amendmentsCount: number; timelineSpanYears: number;
    totalPowers: number;
  };
}

const TAB_LABELS: Record<TabKey, string> = {
  overview: 'Overview',
  bodies: 'Bodies',
  timeline: 'Timeline',
  governance: 'Governance',
};

const RADAR_LABELS: Record<string, string> = {
  registration: 'Registration',
  discipline: 'Discipline',
  financial: 'Financial',
  advisory: 'Advisory',
  operational: 'Operational',
  regulatory: 'Regulatory',
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: '#22c55e',
  medium: '#f59e0b',
  low: '#ef4444',
};

const TIMELINE_COLORS: Record<string, string> = {
  enactment: '#2563eb',
  amendment: '#f59e0b',
  establishment: '#22c55e',
  predecessor: '#94a3b8',
  development: '#8b5cf6',
  governance: '#ec4899',
  devolution: '#06b6d4',
  repeal: '#ef4444',
  related: '#64748b',
  regulation: '#6366f1',
};

const IMPACT_CLASS: Record<string, string> = {
  high: 'impactHigh',
  medium: 'impactMedium',
  low: 'impactLow',
  unknown: 'impactUnknown',
};

const STATUS_COLORS: Record<string, string> = {
  'legally-active': '#22c55e',
  active: '#22c55e',
  obsolete: '#9e9e9e',
  superseded: '#9e9e9e',
  unknown: '#f59e0b',
  repealed: '#ef4444',
  regulated: '#64748b',
  protected: '#8b5cf6',
};

// Group acts by domain for the <select> dropdown
function groupByDomain(acts: Profile[]) {
  const groups: Record<string, Profile[]> = {};
  for (const act of acts) {
    const key = act.domainLabel;
    if (!groups[key]) groups[key] = [];
    groups[key].push(act);
  }
  return groups;
}

function RadarChartInner({ profile }: { profile: Profile }) {
  const recharts = require('recharts');
  const {
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Radar, ResponsiveContainer, Tooltip,
  } = recharts;

  const data = Object.entries(profile.functionalProfile).map(([key, value]) => ({
    axis: RADAR_LABELS[key] || key,
    value,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid stroke="var(--ifm-color-emphasis-300)" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: 'var(--ifm-font-color-base)', fontSize: 12 }}
        />
        <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={false} axisLine={false} />
        <Radar
          dataKey="value"
          stroke={profile.domainColor}
          fill={profile.domainColor}
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--ifm-background-color)',
            border: '1px solid var(--ifm-color-emphasis-300)',
            borderRadius: 8,
            fontSize: '0.85em',
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function RadarChartWrapper({ profile }: { profile: Profile }) {
  return (
    <div className={styles.radarContainer}>
      <h4 className={styles.sectionTitle}>Functional Profile</h4>
      <BrowserOnly fallback={<div className={styles.radarPlaceholder}>Loading chart...</div>}>
        {() => <RadarChartInner profile={profile} />}
      </BrowserOnly>
    </div>
  );
}

function DataConfidencePanel({ confidence }: { confidence: Profile['dataConfidence'] }) {
  const entries = [
    { label: 'Legislative Framework', value: confidence.legislativeFramework },
    { label: 'Historical Details', value: confidence.historicalDetails },
    { label: 'Current Operations', value: confidence.currentOperationalStatus },
  ];

  return (
    <div className={styles.confidencePanel}>
      <h4 className={styles.confidenceTitle}>Data Confidence</h4>
      {entries.map((e) => (
        <div key={e.label} className={styles.confidenceRow}>
          <span
            className={styles.confidenceDot}
            style={{ background: CONFIDENCE_COLORS[e.value] || '#94a3b8' }}
          />
          <span className={styles.confidenceLabel}>
            {e.label}: <strong>{e.value}</strong>
          </span>
        </div>
      ))}
    </div>
  );
}

function CrossReferencesPanel({
  refs,
  onNavigate,
}: {
  refs: Profile['crossReferences'];
  onNavigate: (id: string) => void;
}) {
  return (
    <div className={styles.crossRefPanel}>
      <h4 className={styles.crossRefTitle}>Cross-References</h4>
      {refs.length === 0 ? (
        <div className={styles.emptyState} style={{ padding: '12px 0' }}>
          No cross-references to other acts in this ecosystem.
        </div>
      ) : (
        <div className={styles.crossRefBadges}>
          {refs.map((ref) => (
            <button
              key={ref.id}
              className={styles.crossRefBadge}
              onClick={() => onNavigate(ref.id)}
              title={`Navigate to ${ref.title}`}
            >
              {ref.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OverviewTab({
  profile,
  onNavigate,
}: {
  profile: Profile;
  onNavigate: (id: string) => void;
}) {
  return (
    <div className={styles.overviewGrid}>
      <div className={styles.overviewLeft}>
        <RadarChartWrapper profile={profile} />
      </div>
      <div className={styles.overviewRight}>
        <DataConfidencePanel confidence={profile.dataConfidence} />
        <CrossReferencesPanel refs={profile.crossReferences} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

function BodiesTab({ profile }: { profile: Profile }) {
  if (profile.statutoryBodies.length === 0) {
    return (
      <div className={styles.emptyState}>
        This act does not establish any statutory bodies.
        Governance is exercised through existing government institutions.
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <span className="badge badge--success" style={{ marginRight: 8 }}>
          {profile.stats.activeBodiesCount} Active
        </span>
        <span className="badge badge--secondary">
          {profile.stats.bodiesCount - profile.stats.activeBodiesCount} Obsolete/Unknown
        </span>
      </div>
      {profile.statutoryBodies.map((body) => {
        const isActive = body.currentStatus === 'legally-active';
        const borderColor = isActive ? '#4CAF50' : '#9E9E9E';
        return (
          <div
            key={body.name}
            className={styles.bodyCard}
            style={{ borderLeftColor: borderColor }}
          >
            <div className={styles.bodyHeader}>
              <span className={styles.bodyName}>{body.name}</span>
              <span
                className={`${styles.tierStatus} ${isActive ? styles.bodyStatusActive : styles.bodyStatusInactive}`}
              >
                {body.currentStatus}
              </span>
              <span className={styles.bodySections}>{body.sections}</span>
            </div>
            <div className={styles.bodyMeta}>
              {body.maxMembers != null && <span>Members: {body.maxMembers}</span>}
              <span>Powers: {body.powersCount}</span>
              <span>Operational: {body.operationalStatus}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TimelineLegend() {
  const items = [
    { type: 'enactment', label: 'Enactment' },
    { type: 'amendment', label: 'Amendment' },
    { type: 'establishment', label: 'Establishment' },
    { type: 'predecessor', label: 'Predecessor' },
    { type: 'development', label: 'Development' },
    { type: 'governance', label: 'Governance' },
    { type: 'repeal', label: 'Repeal' },
  ];
  return (
    <div className={styles.timelineLegend}>
      {items.map((item) => (
        <span key={item.type} className={styles.legendItem}>
          <span
            className={styles.legendDot}
            style={{ background: TIMELINE_COLORS[item.type] }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function TimelineTab({ profile }: { profile: Profile }) {
  return (
    <div>
      <h4 className={styles.sectionTitle}>Key Events</h4>
      <TimelineLegend />
      <div className={styles.compactTimeline}>
        {profile.timeline.map((item, i) => (
          <div key={i} className={styles.timelineItem}>
            <span
              className={styles.timelineDot}
              style={{ background: TIMELINE_COLORS[item.type] || '#94a3b8' }}
            />
            <div className={styles.timelineYear}>{item.year}</div>
            <div className={styles.timelineEvent}>{item.event}</div>
          </div>
        ))}
      </div>

      {profile.amendments.length > 0 && (
        <>
          <h4 className={styles.sectionTitle} style={{ marginTop: 24 }}>Amendments</h4>
          <table className={styles.amendmentsTable}>
            <thead>
              <tr>
                <th>Act</th>
                <th>Year</th>
                <th>Impact</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {profile.amendments.map((a, i) => {
                const impactCls = IMPACT_CLASS[a.impactRating] || IMPACT_CLASS.unknown;
                return (
                  <tr key={i}>
                    <td>{a.actNumber}</td>
                    <td>{a.year}</td>
                    <td>
                      <span
                        className={`${styles.impactBadge} ${styles[impactCls]}`}
                      >
                        {a.impactRating}
                      </span>
                    </td>
                    <td>{a.summary}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {profile.amendments.length === 0 && (
        <div className={styles.emptyState} style={{ marginTop: 16 }}>
          No amendments recorded for this act.
        </div>
      )}
    </div>
  );
}

function GovernanceTab({ profile }: { profile: Profile }) {
  const tiers = profile.governanceHierarchy.tiers;

  const levelColors = ['#2563eb', '#0891b2', '#059669', '#7c3aed', '#db2777', '#ea580c'];

  return (
    <div>
      <h4 className={styles.sectionTitle}>Governance Hierarchy</h4>
      {tiers.map((tier, i) => {
        const color = levelColors[(tier.level - 1) % levelColors.length];
        const statusColor = STATUS_COLORS[tier.status] || '#94a3b8';
        return (
          <div
            key={i}
            className={styles.tierCard}
            style={{ marginLeft: (tier.level - 1) * 28 }}
          >
            <span className={styles.tierLevel} style={{ background: color }}>
              L{tier.level}
            </span>
            <span className={styles.tierName}>{tier.name}</span>
            <span
              className={styles.tierStatus}
              style={{
                background: `${statusColor}20`,
                color: statusColor,
              }}
            >
              {tier.status}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function ActAnatomyExplorer() {
  const typedProfiles = profiles as Profile[];
  const [selectedActId, setSelectedActId] = useState(typedProfiles[0].id);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const selectedProfile = useMemo(
    () => typedProfiles.find((p) => p.id === selectedActId) || typedProfiles[0],
    [selectedActId],
  );

  // Reset tab when act changes
  useEffect(() => {
    setActiveTab('overview');
  }, [selectedActId]);

  // URL hash sync
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const found = typedProfiles.find((p) => p.id === hash);
      if (found) setSelectedActId(found.id);
    }
  }, []);

  useEffect(() => {
    window.history.replaceState(null, '', `#${selectedActId}`);
  }, [selectedActId]);

  const grouped = useMemo(() => groupByDomain(typedProfiles), []);

  const handleNavigate = (id: string) => {
    const found = typedProfiles.find((p) => p.id === id);
    if (found) setSelectedActId(found.id);
  };

  return (
    <div className={styles.explorer}>
      {/* Selector Bar */}
      <div className={styles.selectorBar}>
        <select
          className={styles.actSelect}
          value={selectedActId}
          onChange={(e) => setSelectedActId(e.target.value)}
        >
          {Object.entries(grouped).map(([domain, acts]) => (
            <optgroup key={domain} label={domain}>
              {acts.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.title} ({act.year}){act.status === 'repealed' ? ' [REPEALED]' : ''}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <span
          className={styles.domainBadge}
          style={{ background: selectedProfile.domainColor }}
        >
          {selectedProfile.domainLabel}
        </span>
        <span className={styles.kindBadge}>
          {selectedProfile.kind.minor}
        </span>
      </div>

      {/* Hero Panel */}
      <div className={styles.heroPanel}>
        <h2 className={styles.heroTitle}>{selectedProfile.title}</h2>
        <div className={styles.heroMeta}>
          {selectedProfile.number} &middot; {selectedProfile.year} &middot;{' '}
          {selectedProfile.status === 'repealed' ? 'Repealed' : 'Active'}
        </div>

        {selectedProfile.status === 'repealed' && selectedProfile.repealedBy && (
          <div className={styles.repealedWarning}>
            Repealed by {selectedProfile.repealedBy.title} ({selectedProfile.repealedBy.year})
          </div>
        )}

        <div className={styles.statCards}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{selectedProfile.stats.bodiesCount}</div>
            <div className={styles.statLabel}>Bodies</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{selectedProfile.stats.amendmentsCount}</div>
            <div className={styles.statLabel}>Amendments</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{selectedProfile.stats.timelineSpanYears}</div>
            <div className={styles.statLabel}>Years</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{selectedProfile.stats.totalPowers}</div>
            <div className={styles.statLabel}>Powers</div>
          </div>
        </div>

        <p className={styles.heroSummary}>{selectedProfile.summary}</p>
        <a
          className={styles.pdfLink}
          href={selectedProfile.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Source PDF &rarr;
        </a>
      </div>

      {/* Tab Bar */}
      <div className={styles.tabBar}>
        {(Object.keys(TAB_LABELS) as TabKey[]).map((tab) => (
          <button
            key={tab}
            className={`button button--sm ${
              activeTab === tab ? 'button--primary' : 'button--outline button--secondary'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab profile={selectedProfile} onNavigate={handleNavigate} />
      )}
      {activeTab === 'bodies' && <BodiesTab profile={selectedProfile} />}
      {activeTab === 'timeline' && <TimelineTab profile={selectedProfile} />}
      {activeTab === 'governance' && <GovernanceTab profile={selectedProfile} />}
    </div>
  );
}
