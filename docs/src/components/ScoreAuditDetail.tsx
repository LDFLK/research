import React, { useState, useMemo, useEffect } from 'react';
import scorecard from '../data/governance-scorecard.json';
import styles from './ScoreAuditDetail.module.css';

// ===== Types =====

interface McsComponent {
  raw: number;
  max: number;
  normalized: number;
  weight: number;
  contribution: number;
}

interface IvsFactor {
  score: number;
  weight: number;
  source: string;
  label?: string;
}

interface DgqFactor {
  score: number;
  weight: number;
  source: string;
}

interface PdiEntry {
  reason: string;
  penalty: number;
}

interface Body {
  name: string;
  category: string;
  categoryWeight: number;
  ivs: number;
  dgq: number;
  dormancyPenalty: number;
  operationalStatus: string;
  meetingClarity: number;
  quorumDefined: boolean;
  reportingMandated: boolean;
  dissentProtected: boolean;
  powersCount: number;
  powers?: string[];
  ivsBreakdown: {
    meetingClarity: IvsFactor;
    quorumDefined: IvsFactor;
    reportingMandated: IvsFactor;
    dissentProtected: IvsFactor;
    chairType: IvsFactor;
  };
  dgqBreakdown: {
    compositionDiversity: DgqFactor;
    memberSufficiency: DgqFactor;
    powerBreadth: DgqFactor;
    accountabilityChain: DgqFactor;
  };
  pdiBreakdown: PdiEntry[];
}

interface Act {
  actId: string;
  title: string;
  year: number;
  domainCategory: string;
  domainColor: string;
  domainLabel: string;
  mcs: number;
  ivs: number;
  dgq: number;
  pdi: number;
  dcm: number;
  gcs: number;
  grade: string;
  bodies: Body[];
  mcsBreakdown: {
    normBodies: McsComponent;
    normPowers: McsComponent;
    normDepth: McsComponent;
    normBreadth: McsComponent;
    normLinkage: McsComponent;
  };
  dcmBreakdown: {
    legislativeFramework: string;
    historicalDetails: string;
    currentOperationalStatus: string;
    rule: string;
  };
  gcsAssembly: {
    mcsContrib: number;
    ivsContrib: number;
    dgqContrib: number;
    pdiTotal: number;
    rawScore: number;
    clampedScore: number;
    dcmApplied: number;
    finalGcs: number;
  };
}

interface Alert {
  type: string;
  severity: string;
  actTitle: string;
  bodyName: string;
  description: string;
}

const GRADE_CLASS: Record<string, string> = {
  A: 'gradeA', B: 'gradeB', C: 'gradeC', D: 'gradeD', F: 'gradeF',
};

const STATUS_CLASS: Record<string, string> = {
  active: 'statusActive', unknown: 'statusUnknown', superseded: 'statusSuperseded',
};

const CONFIDENCE_CLASS: Record<string, string> = {
  high: 'confidenceHigh', medium: 'confidenceMedium', low: 'confidenceLow',
};

const ALERT_LABELS: Record<string, string> = {
  'governance-void': 'Governance Void',
  'power-dormancy': 'Power Dormancy',
  'structural-gap': 'Structural Gap',
};

const ALERT_SEVERITY_CLASS: Record<string, string> = {
  critical: 'alertCritical', warning: 'alertWarning', info: 'alertInfo',
};

const SEVERITY_BADGE_CLASS: Record<string, string> = {
  critical: 'severityCritical', warning: 'severityWarning', info: 'severityInfo',
};

// ===== Rationale & Rubric Constants =====

const DIMENSION_WEIGHT_RATIONALE: Record<string, { weight: string; why: string }> = {
  MCS: {
    weight: '30%',
    why: 'Mandate completeness measures how thoroughly an act defines its governance architecture. It receives 30% because a well-defined mandate is a necessary foundation, but without operational follow-through (measured by IVS), the mandate alone has limited value.',
  },
  IVS: {
    weight: '35%',
    why: 'Institutional vitality is the strongest predictor of real-world governance quality. A body that meets regularly, defines quorum, reports to oversight, and protects dissent is more likely to function than one that merely exists on paper. It receives the highest weight at 35%.',
  },
  DGQ: {
    weight: '20%',
    why: 'Decision governance quality measures structural fairness — diverse composition, sufficient membership, broad powers, and accountability chains. At 20%, it reflects that good governance structure matters but is less decisive than whether the institution actually operates.',
  },
  PDI: {
    weight: 'Penalty',
    why: 'Power Dormancy is a direct penalty subtracted from the raw score. When a body with legal powers shows no operational evidence, it signals governance failure. The penalty is proportional to the body\'s category weight, so higher-tier dormant bodies produce larger penalties.',
  },
  DCM: {
    weight: 'Scaling',
    why: 'Data Confidence scales the final score to reflect how much we trust our source data. If legislative text is clear but operational data is missing, the score is reduced — ensuring that uncertain scores don\'t appear more reliable than they are.',
  },
};

const MCS_DESCRIPTIONS: Record<string, { description: string; maxExplanation: string }> = {
  'Bodies Count': {
    description: 'Number of distinct statutory bodies established by this act.',
    maxExplanation: 'Max = 6 (the most bodies any single health act creates). Score = raw/6.',
  },
  'Total Powers': {
    description: 'Total number of enumerated powers across all statutory bodies.',
    maxExplanation: 'Max = 27 (highest total powers in any health act). Score = raw/27.',
  },
  'Governance Depth': {
    description: 'Number of governance tiers (e.g., Minister → Board → Committee → Sub-committee).',
    maxExplanation: 'Max = 5 tiers. Score = raw/5.',
  },
  'Functional Breadth': {
    description: 'Number of distinct functional categories (policy, regulatory, advisory, operational, etc.).',
    maxExplanation: 'Max = 6 categories. Score = raw/6.',
  },
  'Cross-Linkage': {
    description: 'Number of explicit cross-references to other acts or institutions.',
    maxExplanation: 'Max = 3 linkages. Score = raw/3.',
  },
};

const MCS_WEIGHT_RATIONALE: Record<string, string> = {
  'Bodies Count': 'Bodies and Powers each get 25% — they are the primary structural indicators of an act\'s governance scope.',
  'Total Powers': 'Bodies and Powers each get 25% — they are the primary structural indicators of an act\'s governance scope.',
  'Governance Depth': 'Depth and Breadth each get 20% — they measure governance sophistication but are less decisive than raw structural scope.',
  'Functional Breadth': 'Depth and Breadth each get 20% — they measure governance sophistication but are less decisive than raw structural scope.',
  'Cross-Linkage': 'Cross-linkage gets 10% — useful for integration but not essential for standalone governance quality.',
};

const IVS_RUBRICS: Record<string, { levels: { score: number; label: string; criteria: string }[] }> = {
  meetingClarity: {
    levels: [
      { score: 1.0, label: 'Clear', criteria: 'Act specifies explicit meeting frequency (e.g., "at least once per month")' },
      { score: 0.5, label: 'Vague', criteria: 'Act mentions meetings but without frequency (e.g., "from time to time")' },
      { score: 0.0, label: 'None', criteria: 'No mention of meeting requirements in the act' },
    ],
  },
  quorumDefined: {
    levels: [
      { score: 1.0, label: 'Yes', criteria: 'Act defines a specific quorum number or fraction for valid decisions' },
      { score: 0.0, label: 'No', criteria: 'No quorum requirement specified in the act' },
    ],
  },
  reportingMandated: {
    levels: [
      { score: 1.0, label: 'Yes', criteria: 'Act mandates reporting to a higher authority (e.g., Minister, Parliament)' },
      { score: 0.0, label: 'No', criteria: 'No reporting obligation specified in the act' },
    ],
  },
  dissentProtected: {
    levels: [
      { score: 1.0, label: 'Yes', criteria: 'Act allows members to record dissenting opinions or written objections' },
      { score: 0.0, label: 'No', criteria: 'No provision for dissent recording in the act' },
    ],
  },
  chairType: {
    levels: [
      { score: 1.0, label: 'Elected', criteria: 'Chair is elected by body members — maximizes independence' },
      { score: 0.7, label: 'Appointed (independent)', criteria: 'Chair appointed by Minister but from outside the body' },
      { score: 0.5, label: 'Ex-officio', criteria: 'Chair is an ex-officio government official — dual loyalties possible' },
      { score: 0.0, label: 'Unknown', criteria: 'Chair selection not specified in the act' },
    ],
  },
};

const IVS_WEIGHT_RATIONALE: Record<string, string> = {
  meetingClarity: '30% — Meeting frequency is the strongest single predictor of institutional activity. A body that never meets is effectively dormant.',
  quorumDefined: '20% — Quorum ensures collective decision-making rather than unilateral action by a subset of members.',
  reportingMandated: '20% — Reporting creates accountability linkage to oversight authorities, enabling scrutiny and course-correction.',
  dissentProtected: '15% — Dissent protection ensures minority views are preserved, preventing groupthink and enabling future audit.',
  chairType: '15% — Chair independence affects meeting agenda, tone, and willingness to challenge executive positions.',
};

const DGQ_RUBRICS: Record<string, { levels: { score: number; label: string; criteria: string }[]; description: string }> = {
  compositionDiversity: {
    description: 'Measures how diverse the body\'s membership composition is (elected, appointed, ex-officio, nominated).',
    levels: [
      { score: 1.0, label: 'High', criteria: 'Multiple appointment pathways (elected + appointed + ex-officio + nominated)' },
      { score: 0.7, label: 'Moderate', criteria: 'Two appointment types (e.g., appointed + ex-officio)' },
      { score: 0.4, label: 'Low', criteria: 'Single appointment type (all appointed or all ex-officio)' },
      { score: 0.0, label: 'None', criteria: 'Composition not specified in the act' },
    ],
  },
  memberSufficiency: {
    description: 'How adequate the body\'s size is for effective deliberation. Score = min(maxMembers/15, 1.0) — bodies below 15 are penalized.',
    levels: [
      { score: 1.0, label: 'Sufficient', criteria: '15+ members — adequate for diverse representation and sub-committees' },
      { score: 0.5, label: 'Marginal', criteria: '7-14 members — functional but limited capacity for specialization' },
      { score: 0.0, label: 'Inadequate', criteria: 'Fewer than 7 members or size not specified' },
    ],
  },
  powerBreadth: {
    description: 'Proportion of the body\'s enumerated powers vs maximum across all bodies. Score = powersCount/15.',
    levels: [
      { score: 1.0, label: 'Comprehensive', criteria: '15+ distinct enumerated powers covering full governance spectrum' },
      { score: 0.5, label: 'Moderate', criteria: '7-14 powers — adequate operational coverage' },
      { score: 0.0, label: 'Narrow', criteria: 'Fewer than 3 powers or powers not enumerated' },
    ],
  },
  accountabilityChain: {
    description: 'Average of three binary indicators: reporting (0/1), audit (0/1), dissent (0/1). Score = sum/3.',
    levels: [
      { score: 1.0, label: 'Full', criteria: 'All three: reporting mandated + audit required + dissent protected' },
      { score: 0.667, label: 'Partial', criteria: 'Two of three accountability mechanisms present' },
      { score: 0.333, label: 'Weak', criteria: 'Only one accountability mechanism present' },
      { score: 0.0, label: 'None', criteria: 'No accountability mechanisms specified' },
    ],
  },
};

const DGQ_WEIGHT_RATIONALE: Record<string, string> = {
  compositionDiversity: '25% — Diverse composition prevents capture by a single stakeholder group and improves legitimacy.',
  memberSufficiency: '15% — Adequate size enables sub-committees and diverse expertise, but size alone doesn\'t ensure quality.',
  powerBreadth: '30% — Broader powers indicate a body was designed to be effective, not merely ceremonial. Highest DGQ weight.',
  accountabilityChain: '30% — Accountability mechanisms (reporting, audit, dissent) are the strongest safeguards against dysfunction.',
};

const BODY_CATEGORY_RATIONALE: Record<string, string> = {
  'National Policy Council': '40% — Policy councils set strategic direction and have the broadest governance mandate. Their vitality is most critical to the act\'s governance effectiveness.',
  'Technical Advisory': '30% — Technical bodies provide specialized expertise. Their dysfunction means decisions lack evidence basis.',
  'Operational Steering': '20% — Operational bodies implement policy. Important but downstream of policy/technical quality.',
  'Administrative Support': '10% — Administrative bodies handle logistics. Least impact on governance quality but still relevant.',
};

const DCM_RUBRIC = [
  { modifier: 1.0, rule: 'All three dimensions are "high"', meaning: 'Full confidence — score reflects reality accurately' },
  { modifier: 0.8, rule: 'Any dimension is "medium" (none "low")', meaning: 'Moderate uncertainty — score may be slightly higher/lower' },
  { modifier: 0.6, rule: 'Exactly one dimension is "low"', meaning: 'Significant gap — one data source is unreliable' },
  { modifier: 0.4, rule: 'Two or more dimensions are "low"', meaning: 'Low confidence — score is largely indicative, not definitive' },
];

// ===== Helpers =====

function groupByDomain(acts: Act[]) {
  const groups: Record<string, Act[]> = {};
  for (const act of acts) {
    const key = act.domainLabel;
    if (!groups[key]) groups[key] = [];
    groups[key].push(act);
  }
  return groups;
}

function fmt(n: number, d = 3) {
  return n.toFixed(d);
}

// ===== Sub-Components =====

function GradeBadge({ grade }: { grade: string }) {
  return (
    <span className={`${styles.gradeBadge} ${styles[GRADE_CLASS[grade] || 'gradeF']}`}>
      {grade}
    </span>
  );
}

function ActSelector({
  acts,
  selectedActId,
  onSelect,
}: {
  acts: Act[];
  selectedActId: string;
  onSelect: (id: string) => void;
}) {
  const grouped = useMemo(() => groupByDomain(acts), [acts]);
  const selected = acts.find(a => a.actId === selectedActId) || acts[0];

  return (
    <div className={styles.actSelector}>
      <select
        className={styles.actSelect}
        value={selectedActId}
        onChange={(e) => onSelect(e.target.value)}
      >
        {Object.entries(grouped).map(([domain, domActs]) => (
          <optgroup key={domain} label={domain}>
            {domActs.map((act) => (
              <option key={act.actId} value={act.actId}>
                {act.title} ({act.year}) — GCS {act.gcs.toFixed(3)} [{act.grade}]
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <span className={styles.domainBadge} style={{ background: selected.domainColor }}>
        {selected.domainLabel}
      </span>
    </div>
  );
}

function ActSummaryPanel({ act }: { act: Act }) {
  return (
    <div className={styles.actSummaryPanel} style={{ borderLeftColor: act.domainColor }}>
      <div className={styles.summaryLeft}>
        <h2 className={styles.summaryTitle}>{act.title} ({act.year})</h2>
        <div className={styles.summaryMeta}>
          {act.domainLabel} — {act.bodies.length} {act.bodies.length === 1 ? 'body' : 'bodies'}
        </div>
      </div>
      <div className={styles.summaryRight}>
        <span className={styles.gcsValue}>{act.gcs.toFixed(3)}</span>
        <GradeBadge grade={act.grade} />
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  badge,
  scoreBadge,
  defaultOpen,
  children,
}: {
  title: string;
  badge?: string;
  scoreBadge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div className={styles.auditSection}>
      <div className={styles.auditSectionHeader} onClick={() => setOpen(!open)}>
        <span className={`${styles.sectionToggle} ${open ? styles.sectionToggleOpen : ''}`}>
          &#9654;
        </span>
        <span className={styles.auditSectionTitle}>{title}</span>
        {badge && <span className={styles.weightBadge}>{badge}</span>}
        {scoreBadge && <span className={styles.scoreBadge}>{scoreBadge}</span>}
      </div>
      {open && <div className={styles.auditSectionBody}>{children}</div>}
    </div>
  );
}

function ScoreScale({ value, min = 0, max = 1, label }: { value: number; min?: number; max?: number; label?: string }) {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const clampedPct = Math.max(0, Math.min(100, pct));

  return (
    <div className={styles.scoreScale}>
      <div className={styles.scaleTrack}>
        <div className={styles.scaleFill} style={{ width: `${clampedPct}%` }} />
        <div className={styles.scaleMarker} style={{ left: `${clampedPct}%` }}>
          <span className={styles.scaleMarkerLabel}>{typeof value === 'number' ? value.toFixed(3) : value}</span>
        </div>
      </div>
      <div className={styles.scaleLabels}>
        <span>{min.toFixed(min === 0 ? 0 : 2)}</span>
        {label && <span className={styles.scaleCenterLabel}>{label}</span>}
        <span>{max.toFixed(max === 1 ? 0 : 2)}</span>
      </div>
    </div>
  );
}

function WeightRationale({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.rationale}>
      <button className={styles.rationaleToggle} onClick={() => setOpen(!open)}>
        {open ? '\u25BE' : '\u25B8'} Why this weight?
      </button>
      {open && <div className={styles.rationaleText}>{text}</div>}
    </div>
  );
}

function ScoringRubric({ levels, currentScore }: { levels: { score: number; label: string; criteria: string }[]; currentScore: number }) {
  return (
    <div className={styles.rubric}>
      {levels.map((level) => {
        const isActive = Math.abs(level.score - currentScore) < 0.01;
        return (
          <div key={level.score} className={`${styles.rubricLevel} ${isActive ? styles.rubricLevelActive : ''}`}>
            <span className={styles.rubricScore}>{level.score.toFixed(1)}</span>
            <span className={styles.rubricLabel}>{level.label}</span>
            <span className={styles.rubricCriteria}>{level.criteria}</span>
          </div>
        );
      })}
    </div>
  );
}

function PowersList({ powers, powersCount }: { powers: string[]; powersCount: number }) {
  const [open, setOpen] = useState(false);
  const citationRegex = /(\((?:S\.|Part |Section )[\w\d\-,.()\s]+\))$/;

  return (
    <div className={styles.powersList}>
      <button className={styles.powersToggle} onClick={() => setOpen(!open)}>
        {open ? '\u25BE' : '\u25B8'} {powers.length} enumerated power{powers.length !== 1 ? 's' : ''}
      </button>
      {open && (
        <ol className={styles.powersItems}>
          {powers.map((power, i) => {
            const match = power.match(citationRegex);
            const description = match ? power.slice(0, match.index).trim() : power;
            const citation = match ? match[1] : null;
            return (
              <li key={i} className={styles.powerItem}>
                <span className={styles.powerDescription}>{description}</span>
                {citation && (
                  <>
                    {' '}
                    <span className={styles.powerCitation}>{citation}</span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function MCSSection({ act }: { act: Act }) {
  const b = act.mcsBreakdown;
  const rows = [
    { label: 'Bodies Count', ...b.normBodies },
    { label: 'Total Powers', ...b.normPowers },
    { label: 'Governance Depth', ...b.normDepth },
    { label: 'Functional Breadth', ...b.normBreadth },
    { label: 'Cross-Linkage', ...b.normLinkage },
  ];
  const total = rows.reduce((s, r) => s + r.contribution, 0);
  const maxContrib = Math.max(...rows.map(r => r.contribution), 0.001);

  return (
    <CollapsibleSection
      title="1. Mandate Completeness (MCS)"
      badge="Weight: 30%"
      scoreBadge={`MCS = ${act.mcs.toFixed(3)}`}
    >
      <WeightRationale text={DIMENSION_WEIGHT_RATIONALE.MCS.why} />
      <table className={styles.auditTable}>
        <thead>
          <tr>
            <th>Component</th>
            <th>Raw</th>
            <th>Max</th>
            <th>Normalized</th>
            <th>Weight</th>
            <th>Contribution</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td>
                <strong>{r.label}</strong>
                {MCS_DESCRIPTIONS[r.label] && (
                  <div className={styles.factorDescription}>{MCS_DESCRIPTIONS[r.label].description}</div>
                )}
              </td>
              <td>{r.raw}</td>
              <td>{r.max}</td>
              <td>
                {fmt(r.normalized)}
                <ScoreScale value={r.normalized} />
                {MCS_DESCRIPTIONS[r.label] && (
                  <div className={styles.factorDescription}>{MCS_DESCRIPTIONS[r.label].maxExplanation}</div>
                )}
              </td>
              <td>{fmt(r.weight, 2)}</td>
              <td>
                <span
                  className={styles.contributionBar}
                  style={{ width: `${(r.contribution / maxContrib) * 60}px` }}
                />
                {fmt(r.contribution)}
                {MCS_WEIGHT_RATIONALE[r.label] && (
                  <WeightRationale text={MCS_WEIGHT_RATIONALE[r.label]} />
                )}
              </td>
            </tr>
          ))}
          <tr className={styles.totalRow}>
            <td colSpan={5}>MCS Total</td>
            <td>{fmt(total)}</td>
          </tr>
        </tbody>
      </table>
    </CollapsibleSection>
  );
}

function IVSSection({ act }: { act: Act }) {
  if (act.bodies.length === 0) {
    return (
      <CollapsibleSection
        title="2. Institutional Vitality (IVS)"
        badge="Weight: 35%"
        scoreBadge={`IVS = ${act.ivs.toFixed(3)}`}
      >
        <WeightRationale text={DIMENSION_WEIGHT_RATIONALE.IVS.why} />
        <div className={styles.noBodies}>
          No statutory bodies established by this act. IVS = 0.
        </div>
      </CollapsibleSection>
    );
  }

  return (
    <CollapsibleSection
      title="2. Institutional Vitality (IVS)"
      badge="Weight: 35%"
      scoreBadge={`IVS = ${act.ivs.toFixed(3)}`}
    >
      <WeightRationale text={DIMENSION_WEIGHT_RATIONALE.IVS.why} />
      {act.bodies.map((body) => {
        const bd = body.ivsBreakdown;
        const factors = [
          { key: 'meetingClarity', label: 'Meeting Clarity', ...bd.meetingClarity },
          { key: 'quorumDefined', label: 'Quorum Defined', ...bd.quorumDefined },
          { key: 'reportingMandated', label: 'Reporting Mandated', ...bd.reportingMandated },
          { key: 'dissentProtected', label: 'Dissent Protected', ...bd.dissentProtected },
          { key: 'chairType', label: `Chair Type (${bd.chairType.label || ''})`, ...bd.chairType },
        ];
        const bodyIvs = factors.reduce((s, f) => s + f.score * f.weight, 0);

        return (
          <div key={body.name} className={styles.bodyCard}>
            <div className={styles.bodyCardHeader}>
              <span className={styles.bodyCardName}>{body.name}</span>
              <span className={styles.categoryBadge}>
                {body.category} ({body.categoryWeight})
              </span>
              <span className={styles.bodyScoreBadge}>IVS = {body.ivs.toFixed(3)}</span>
              <span className={`${styles[STATUS_CLASS[body.operationalStatus] || '']}`}>
                {body.operationalStatus}
              </span>
            </div>
            {BODY_CATEGORY_RATIONALE[body.category] && (
              <WeightRationale text={BODY_CATEGORY_RATIONALE[body.category]} />
            )}
            <div className={styles.factorCards}>
              {factors.map((f) => {
                const rubric = IVS_RUBRICS[f.key];
                const weightText = IVS_WEIGHT_RATIONALE[f.key];
                return (
                  <div key={f.key} className={styles.factorCard}>
                    <div className={styles.factorHeader}>
                      <strong>{f.label}</strong>
                      <span className={styles.factorScoreInline}>{fmt(f.score, 2)}</span>
                      <span className={styles.factorWeightInline}>w={fmt(f.weight, 2)}</span>
                    </div>
                    <div className={styles.factorBody}>
                      <ScoreScale value={f.score} />
                      {rubric && (
                        <ScoringRubric levels={rubric.levels} currentScore={f.score} />
                      )}
                      <div className={styles.sourceText}>{f.source}</div>
                      {weightText && <WeightRationale text={weightText} />}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={styles.totalRow} style={{ padding: '8px 0', fontWeight: 700 }}>
              Body IVS = {fmt(bodyIvs)}
            </div>
          </div>
        );
      })}
      <div className={styles.weightedAvg}>
        Weighted avg IVS = {act.ivs.toFixed(3)} (body weights: {act.bodies.map(b => b.categoryWeight).join(' + ')} = {act.bodies.reduce((s, b) => s + b.categoryWeight, 0).toFixed(1)})
      </div>
    </CollapsibleSection>
  );
}

function DGQSection({ act }: { act: Act }) {
  if (act.bodies.length === 0) {
    return (
      <CollapsibleSection
        title="3. Decision Governance Quality (DGQ)"
        badge="Weight: 20%"
        scoreBadge={`DGQ = ${act.dgq.toFixed(3)}`}
      >
        <WeightRationale text={DIMENSION_WEIGHT_RATIONALE.DGQ.why} />
        <div className={styles.noBodies}>
          No statutory bodies established by this act. DGQ = 0.
        </div>
      </CollapsibleSection>
    );
  }

  return (
    <CollapsibleSection
      title="3. Decision Governance Quality (DGQ)"
      badge="Weight: 20%"
      scoreBadge={`DGQ = ${act.dgq.toFixed(3)}`}
    >
      <WeightRationale text={DIMENSION_WEIGHT_RATIONALE.DGQ.why} />
      {act.bodies.map((body) => {
        const bd = body.dgqBreakdown;
        const factors = [
          { key: 'compositionDiversity', label: 'Composition Diversity', ...bd.compositionDiversity },
          { key: 'memberSufficiency', label: 'Member Sufficiency', ...bd.memberSufficiency },
          { key: 'powerBreadth', label: 'Power Breadth', ...bd.powerBreadth },
          { key: 'accountabilityChain', label: 'Accountability Chain', ...bd.accountabilityChain },
        ];
        const bodyDgq = factors.reduce((s, f) => s + f.score * f.weight, 0);

        return (
          <div key={body.name} className={styles.bodyCard}>
            <div className={styles.bodyCardHeader}>
              <span className={styles.bodyCardName}>{body.name}</span>
              <span className={styles.categoryBadge}>
                {body.category} ({body.categoryWeight})
              </span>
              <span className={styles.bodyScoreBadge}>DGQ = {body.dgq.toFixed(3)}</span>
            </div>
            {BODY_CATEGORY_RATIONALE[body.category] && (
              <WeightRationale text={BODY_CATEGORY_RATIONALE[body.category]} />
            )}
            <div className={styles.factorCards}>
              {factors.map((f) => {
                const rubric = DGQ_RUBRICS[f.key];
                const weightText = DGQ_WEIGHT_RATIONALE[f.key];
                return (
                  <div key={f.key} className={styles.factorCard}>
                    <div className={styles.factorHeader}>
                      <strong>{f.label}</strong>
                      <span className={styles.factorScoreInline}>{fmt(f.score, 2)}</span>
                      <span className={styles.factorWeightInline}>w={fmt(f.weight, 2)}</span>
                    </div>
                    <div className={styles.factorBody}>
                      {rubric && (
                        <div className={styles.factorDescription}>{rubric.description}</div>
                      )}
                      <ScoreScale value={f.score} />
                      {rubric && (
                        <ScoringRubric levels={rubric.levels} currentScore={f.score} />
                      )}
                      <div className={styles.sourceText}>{f.source}</div>
                      {f.key === 'powerBreadth' && body.powers && body.powers.length > 0 && (
                        <PowersList powers={body.powers} powersCount={body.powersCount} />
                      )}
                      {weightText && <WeightRationale text={weightText} />}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={styles.totalRow} style={{ padding: '8px 0', fontWeight: 700 }}>
              Body DGQ = {fmt(bodyDgq)}
            </div>
          </div>
        );
      })}
      <div className={styles.weightedAvg}>
        Weighted avg DGQ = {act.dgq.toFixed(3)}
      </div>
    </CollapsibleSection>
  );
}

function PDISection({ act }: { act: Act }) {
  if (act.bodies.length === 0) {
    return (
      <CollapsibleSection
        title="4. Power Dormancy Index (PDI)"
        badge="Penalty"
        scoreBadge={`PDI = ${act.pdi.toFixed(3)}`}
      >
        <div className={styles.noBodies}>
          No statutory bodies. PDI = 0 (no penalty applies).
        </div>
      </CollapsibleSection>
    );
  }

  const bodiesWithPenalty = act.bodies.filter(b => b.dormancyPenalty < 0);

  return (
    <CollapsibleSection
      title="4. Power Dormancy Index (PDI)"
      badge="Penalty"
      scoreBadge={`PDI = ${act.pdi.toFixed(3)}`}
    >
      <WeightRationale text={DIMENSION_WEIGHT_RATIONALE.PDI.why} />
      {bodiesWithPenalty.length === 0 ? (
        <div className={styles.noBodies}>
          No dormancy penalties. All bodies are operationally active.
        </div>
      ) : (
        <>
          <table className={styles.auditTable}>
            <thead>
              <tr>
                <th>Body</th>
                <th>Status</th>
                <th>Category Weight</th>
                <th>Raw Penalty</th>
                <th>Weighted Penalty</th>
              </tr>
            </thead>
            <tbody>
              {bodiesWithPenalty.map((body) => (
                <tr key={body.name}>
                  <td><strong>{body.name}</strong></td>
                  <td>
                    <span className={styles[STATUS_CLASS[body.operationalStatus] || '']}>
                      {body.operationalStatus}
                    </span>
                  </td>
                  <td>{body.categoryWeight}</td>
                  <td>{fmt(body.dormancyPenalty)}</td>
                  <td>{fmt(body.dormancyPenalty * body.categoryWeight)}</td>
                </tr>
              ))}
              <tr className={styles.totalRow}>
                <td colSpan={4}>Total PDI</td>
                <td>{fmt(act.pdi)}</td>
              </tr>
            </tbody>
          </table>
          {bodiesWithPenalty.map((body) =>
            body.pdiBreakdown.map((p, i) => (
              <div key={`${body.name}-${i}`} className={styles.penaltyRow}>
                <span className={styles.penaltyValue}>{fmt(p.penalty)}</span>
                <span className={styles.penaltyReason}>{p.reason}</span>
              </div>
            ))
          )}
        </>
      )}
    </CollapsibleSection>
  );
}

function DCMSection({ act }: { act: Act }) {
  const d = act.dcmBreakdown;
  const levels = [
    { label: 'Legislative Framework', value: d.legislativeFramework },
    { label: 'Historical Details', value: d.historicalDetails },
    { label: 'Current Operational Status', value: d.currentOperationalStatus },
  ];

  return (
    <CollapsibleSection
      title="5. Data Confidence Modifier (DCM)"
      badge="Scaling"
      scoreBadge={`DCM = ${act.dcm.toFixed(1)}`}
    >
      <WeightRationale text={DIMENSION_WEIGHT_RATIONALE.DCM.why} />
      <div className={styles.dcmGrid}>
        {levels.map((l) => (
          <div key={l.label} className={styles.dcmLevel}>
            <div className={styles.dcmLevelLabel}>{l.label}</div>
            <div className={`${styles.dcmLevelValue} ${styles[CONFIDENCE_CLASS[l.value] || '']}`}>
              {l.value}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.dcmRule}>{d.rule}</div>
      <table className={styles.auditTable}>
        <thead>
          <tr>
            <th>Modifier</th>
            <th>Rule</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          {DCM_RUBRIC.map((r) => {
            const isActive = Math.abs(r.modifier - act.dcm) < 0.01;
            return (
              <tr key={r.modifier} className={isActive ? styles.dcmRubricActive : ''}>
                <td><strong>{r.modifier.toFixed(1)}</strong></td>
                <td>{r.rule}</td>
                <td>{r.meaning}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className={styles.formulaBlock}>
        DCM = {act.dcm.toFixed(1)}
      </div>
    </CollapsibleSection>
  );
}

function AssemblySection({ act }: { act: Act }) {
  const a = act.gcsAssembly;
  return (
    <CollapsibleSection
      title="6. Final GCS Assembly"
      badge="Formula"
      scoreBadge={`GCS = ${act.gcs.toFixed(3)}`}
    >
      <div className={styles.gcsScaleWrapper}>
        <ScoreScale value={a.finalGcs} label="Final GCS" />
      </div>
      <div className={styles.formulaBlock}>
{`raw = 0.30 × MCS + 0.35 × IVS + 0.20 × DGQ + PDI
    = 0.30 × ${act.mcs.toFixed(3)} + 0.35 × ${act.ivs.toFixed(3)} + 0.20 × ${act.dgq.toFixed(3)} + (${act.pdi.toFixed(3)})
    = ${fmt(a.mcsContrib)} + ${fmt(a.ivsContrib)} + ${fmt(a.dgqContrib)} + (${fmt(a.pdiTotal)})
    = ${fmt(a.rawScore)}

clamped = max(0, min(1, ${fmt(a.rawScore)})) = ${fmt(a.clampedScore)}

GCS = ${fmt(a.clampedScore)} × ${a.dcmApplied.toFixed(1)} = ${fmt(a.finalGcs)}  →  Grade ${act.grade}`}
      </div>
      <div style={{ marginTop: 12 }}>
        <div className={styles.assemblyStep}>
          <span className={styles.assemblyStepLabel}>MCS contrib:</span>
          <span className={styles.assemblyStepValue}>0.30 × {act.mcs.toFixed(3)} = {fmt(a.mcsContrib)}</span>
        </div>
        <div className={styles.assemblyStep}>
          <span className={styles.assemblyStepLabel}>IVS contrib:</span>
          <span className={styles.assemblyStepValue}>0.35 × {act.ivs.toFixed(3)} = {fmt(a.ivsContrib)}</span>
        </div>
        <div className={styles.assemblyStep}>
          <span className={styles.assemblyStepLabel}>DGQ contrib:</span>
          <span className={styles.assemblyStepValue}>0.20 × {act.dgq.toFixed(3)} = {fmt(a.dgqContrib)}</span>
        </div>
        <div className={styles.assemblyStep}>
          <span className={styles.assemblyStepLabel}>PDI penalty:</span>
          <span className={styles.assemblyStepValue}>{fmt(a.pdiTotal)}</span>
        </div>
        <div className={styles.assemblyStep}>
          <span className={styles.assemblyStepLabel}>Raw score:</span>
          <span className={styles.assemblyStepValue}>{fmt(a.rawScore)}</span>
        </div>
        <div className={styles.assemblyStep}>
          <span className={styles.assemblyStepLabel}>DCM applied:</span>
          <span className={styles.assemblyStepValue}>× {a.dcmApplied.toFixed(1)}</span>
        </div>
        <div className={styles.assemblyStep}>
          <span className={styles.assemblyStepLabel}>Final GCS:</span>
          <span className={styles.assemblyStepValue}><strong>{fmt(a.finalGcs)}</strong> → Grade {act.grade}</span>
        </div>
      </div>
    </CollapsibleSection>
  );
}

function ActAlertsSection({ act, alerts }: { act: Act; alerts: Alert[] }) {
  const actAlerts = alerts.filter(a => a.actTitle === act.title);

  if (actAlerts.length === 0) {
    return (
      <CollapsibleSection
        title="7. Alerts"
        scoreBadge="None"
        defaultOpen={false}
      >
        <div className={styles.noBodies}>No alerts for this act.</div>
      </CollapsibleSection>
    );
  }

  return (
    <CollapsibleSection
      title="7. Alerts"
      scoreBadge={`${actAlerts.length} alert${actAlerts.length > 1 ? 's' : ''}`}
      defaultOpen={false}
    >
      {actAlerts.map((alert, i) => (
        <div
          key={i}
          className={`${styles.alertCard} ${styles[ALERT_SEVERITY_CLASS[alert.severity] || '']}`}
        >
          <div className={styles.alertType}>
            {ALERT_LABELS[alert.type] || alert.type}
            <span className={`${styles.severityBadge} ${styles[SEVERITY_BADGE_CLASS[alert.severity] || '']}`}>
              {alert.severity}
            </span>
          </div>
          <div className={styles.alertDesc}>{alert.description}</div>
        </div>
      ))}
    </CollapsibleSection>
  );
}

// ===== Main Component =====

export default function ScoreAuditDetail() {
  const acts = scorecard.acts as Act[];
  const alerts = scorecard.alerts as Alert[];
  const [selectedActId, setSelectedActId] = useState(acts[0].actId);

  const selectedAct = useMemo(
    () => acts.find(a => a.actId === selectedActId) || acts[0],
    [selectedActId, acts],
  );

  // URL hash sync
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const found = acts.find(a => a.actId === hash);
      if (found) setSelectedActId(found.actId);
    }
  }, [acts]);

  useEffect(() => {
    window.history.replaceState(null, '', `#${selectedActId}`);
  }, [selectedActId]);

  return (
    <div className={styles.auditPage}>
      <a href="/docs/governance-scorecard/" className={styles.backLink}>
        ← Back to Scorecard
      </a>

      <ActSelector
        acts={acts}
        selectedActId={selectedActId}
        onSelect={setSelectedActId}
      />

      <ActSummaryPanel act={selectedAct} />

      <MCSSection act={selectedAct} />
      <IVSSection act={selectedAct} />
      <DGQSection act={selectedAct} />
      <PDISection act={selectedAct} />
      <DCMSection act={selectedAct} />
      <AssemblySection act={selectedAct} />
      <ActAlertsSection act={selectedAct} alerts={alerts} />
    </div>
  );
}
