import React, { useState } from 'react';
import defaultAnalysisData from '../data/health-services-act-analysis.json';
import { StatusBadge } from './StatusIndicator';

type TabKey = 'composition' | 'meetings' | 'powers' | 'gaps';

interface ExOfficioMember {
  role: string;
  note: string;
  count: number;
}

interface NominatedMember {
  role: string;
  note: string;
  maxCount: number;
}

interface Composition {
  maxMembers: number | null;
  exOfficio: ExOfficioMember[];
  nominated: NominatedMember[];
  termLength: string;
  reNomination: boolean | null;
}

interface Meetings {
  frequency: string;
  convenedBy: string;
  chairperson: string;
  quorum: string;
  location: string;
  reporting: string;
  dissentMechanism: string;
}

interface StatutoryBody {
  id: string;
  name: string;
  kind: { major: string; minor: string };
  sections: string;
  currentStatus: string;
  operationalStatus: string;
  statusNote: string;
  composition: Composition;
  meetings: Meetings;
  powers: string[];
  dataGaps: string[];
}

const TAB_LABELS: Record<TabKey, string> = {
  composition: 'Composition',
  meetings: 'Meetings',
  powers: 'Powers',
  gaps: 'Data Gaps',
};

function CompositionTab({ body }: { body: StatutoryBody }) {
  const { composition } = body;

  if (!composition.maxMembers) {
    return (
      <div className="alert alert--secondary">
        <strong>Composition details unavailable.</strong> Relevant sections are behind a paywall.
      </div>
    );
  }

  return (
    <div>
      <p>
        <strong>Maximum Members:</strong> {composition.maxMembers} |{' '}
        <strong>Term:</strong> {composition.termLength} |{' '}
        <strong>Re-nomination:</strong> {composition.reNomination ? 'Eligible' : 'N/A'}
      </p>

      {composition.exOfficio.length > 0 && (
        <>
          <h5>Ex-Officio Members ({composition.exOfficio.reduce((s, m) => s + m.count, 0)})</h5>
          <table className="table table--striped">
            <thead>
              <tr><th>Role</th><th>Note</th></tr>
            </thead>
            <tbody>
              {composition.exOfficio.map((m, i) => (
                <tr key={i}><td>{m.role}</td><td>{m.note || '—'}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {composition.nominated.length > 0 && (
        <>
          <h5>Nominated Members (up to {composition.nominated.reduce((s, m) => s + m.maxCount, 0)})</h5>
          <table className="table table--striped">
            <thead>
              <tr><th>Role</th><th>Max</th><th>Note</th></tr>
            </thead>
            <tbody>
              {composition.nominated.map((m, i) => (
                <tr key={i}><td>{m.role}</td><td>{m.maxCount}</td><td>{m.note || '—'}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

function MeetingsTab({ body }: { body: StatutoryBody }) {
  const { meetings } = body;
  const entries = Object.entries(meetings) as [string, string][];

  return (
    <table className="table table--striped">
      <thead>
        <tr><th>Aspect</th><th>Requirement</th></tr>
      </thead>
      <tbody>
        {entries.map(([key, value]) => (
          <tr key={key}>
            <td><strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</strong></td>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PowersTab({ body }: { body: StatutoryBody }) {
  return (
    <ul>
      {body.powers.map((p, i) => (
        <li key={i}>{p}</li>
      ))}
    </ul>
  );
}

function GapsTab({ body }: { body: StatutoryBody }) {
  return (
    <div className="alert alert--warning">
      <strong>Known Data Gaps</strong>
      <ul style={{ marginBottom: 0 }}>
        {body.dataGaps.map((g, i) => (
          <li key={i}>{g}</li>
        ))}
      </ul>
    </div>
  );
}

function BodyCard({ body }: { body: StatutoryBody }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('composition');

  const isActive = body.currentStatus === 'legally-active';
  const borderColor = isActive ? '#4CAF50' : '#9E9E9E';

  return (
    <div className="card margin-bottom--md" style={{ borderLeft: `4px solid ${borderColor}` }}>
      <div
        className="card__header"
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{expanded ? '▼' : '▶'}</span>
            <strong>{body.name}</strong>
            <StatusBadge status={body.currentStatus as any} />
            <span style={{ fontSize: '0.85em', color: 'gray' }}>{body.sections}</span>
          </div>
          <span className="badge badge--secondary">
            {body.kind.major}/{body.kind.minor}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="card__body">
          <p style={{ color: 'gray', fontStyle: 'italic', marginBottom: '16px' }}>{body.statusNote}</p>

          <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {(Object.keys(TAB_LABELS) as TabKey[]).map((tab) => (
              <button
                key={tab}
                className={`button button--sm ${activeTab === tab ? 'button--primary' : 'button--outline button--secondary'}`}
                onClick={() => setActiveTab(tab)}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>

          {activeTab === 'composition' && <CompositionTab body={body} />}
          {activeTab === 'meetings' && <MeetingsTab body={body} />}
          {activeTab === 'powers' && <PowersTab body={body} />}
          {activeTab === 'gaps' && <GapsTab body={body} />}
        </div>
      )}
    </div>
  );
}

export default function StatutoryBodiesExplorer({ data }: { data?: { statutoryBodies: StatutoryBody[] } } = {}) {
  const bodies = (data || defaultAnalysisData).statutoryBodies as StatutoryBody[];
  const activeCount = bodies.filter((b) => b.currentStatus === 'legally-active').length;

  return (
    <div className="margin-vert--lg">
      <div style={{ marginBottom: '16px' }}>
        <span className="badge badge--success" style={{ marginRight: '8px' }}>
          {activeCount} Legally Active
        </span>
        <span className="badge badge--secondary">
          {bodies.length - activeCount} Obsolete
        </span>
      </div>

      {bodies.map((body) => (
        <BodyCard key={body.id} body={body} />
      ))}
    </div>
  );
}
