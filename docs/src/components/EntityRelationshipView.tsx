import React, { useState } from 'react';
import analysisData from '../data/health-services-act-analysis.json';

interface HierarchyTier {
  level: number;
  name: string;
  scope: string;
  status: string;
  relationship: string;
}

interface CurrentReplacement {
  national: string;
  provincial: string;
  regional: string;
  local: string;
}

interface GovernanceHierarchy {
  tiers: HierarchyTier[];
  currentReplacement: CurrentReplacement;
}

interface DataConfidence {
  legislativeFramework: string;
  historicalDetails: string;
  currentOperationalStatus: string;
}

function TierCard({ tier }: { tier: HierarchyTier }) {
  const isActive = tier.status === 'legally-active';
  return (
    <div
      className="card"
      style={{
        marginBottom: '8px',
        borderLeft: `4px solid ${isActive ? '#4CAF50' : '#9E9E9E'}`,
        marginLeft: `${(tier.level - 1) * 32}px`,
      }}
    >
      <div className="card__header" style={{ padding: '8px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <strong>Level {tier.level}: {tier.name}</strong>
          <span className={`badge ${isActive ? 'badge--success' : 'badge--secondary'}`}>
            {isActive ? 'Active' : 'Obsolete'}
          </span>
          <span className="badge badge--info">{tier.scope}</span>
        </div>
        <div style={{ fontSize: '0.85em', color: 'gray', marginTop: '4px' }}>{tier.relationship}</div>
      </div>
    </div>
  );
}

function OpenGINMappingTable() {
  const bodies = analysisData.statutoryBodies;
  const act = analysisData.act;

  return (
    <table className="table table--striped">
      <thead>
        <tr>
          <th>Entity</th>
          <th>OpenGIN Kind (major)</th>
          <th>OpenGIN Kind (minor)</th>
          <th>ID</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>{act.title}</strong></td>
          <td><code>{act.kind.major}</code></td>
          <td><code>{act.kind.minor}</code></td>
          <td><code>{act.id}</code></td>
          <td><span className="badge badge--success">Active</span></td>
        </tr>
        {bodies.map((body) => (
          <tr key={body.id}>
            <td><strong>{body.name}</strong></td>
            <td><code>{body.kind.major}</code></td>
            <td><code>{body.kind.minor}</code></td>
            <td><code>{body.id}</code></td>
            <td>
              <span className={`badge ${body.currentStatus === 'legally-active' ? 'badge--success' : 'badge--secondary'}`}>
                {body.currentStatus === 'legally-active' ? 'Active' : 'Obsolete'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function EntityRelationshipView() {
  const [showMapping, setShowMapping] = useState(false);
  const hierarchy = analysisData.governanceHierarchy as GovernanceHierarchy;
  const confidence = analysisData.dataConfidence as DataConfidence;
  const replacement = hierarchy.currentReplacement;

  return (
    <div className="margin-vert--lg">
      <h3>Governance Hierarchy (1952 Design)</h3>
      <div style={{ marginBottom: '16px' }}>
        {hierarchy.tiers.map((tier) => (
          <TierCard key={tier.level} tier={tier} />
        ))}
      </div>

      <h3>Current Replacement Structure (Post-1989)</h3>
      <div style={{ marginBottom: '24px' }}>
        {([
          { level: 1, name: 'National', scope: 'National', description: replacement.national },
          { level: 2, name: 'Provincial', scope: 'Provincial', description: replacement.provincial },
          { level: 3, name: 'Regional', scope: 'Regional', description: replacement.regional },
          { level: 4, name: 'Local', scope: 'Local', description: replacement.local },
        ]).map((tier) => (
          <div
            key={tier.level}
            className="card"
            style={{
              marginBottom: '8px',
              borderLeft: '4px solid #1976D2',
              marginLeft: `${(tier.level - 1) * 32}px`,
            }}
          >
            <div className="card__header" style={{ padding: '8px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <strong>Level {tier.level}: {tier.name}</strong>
                <span className="badge badge--primary">{tier.scope}</span>
              </div>
              <div style={{ fontSize: '0.85em', color: 'gray', marginTop: '4px' }}>{tier.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <button
          className={`button button--sm ${showMapping ? 'button--primary' : 'button--outline button--primary'}`}
          onClick={() => setShowMapping(!showMapping)}
        >
          {showMapping ? 'Hide' : 'Show'} OpenGIN Entity Mapping
        </button>
      </div>

      {showMapping && <OpenGINMappingTable />}

      <h3>Data Confidence</h3>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {Object.entries(confidence).map(([key, level]) => (
          <div key={key} style={{ padding: '8px 12px', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.8em', color: 'gray' }}>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
            </div>
            <span className={`badge ${level === 'high' ? 'badge--success' : level === 'medium' ? 'badge--warning' : 'badge--danger'}`}>
              {level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
