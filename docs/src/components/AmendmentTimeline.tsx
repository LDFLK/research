import React, { useState } from 'react';
import analysisData from '../data/health-services-act-analysis.json';
import { ImpactBadge } from './StatusIndicator';

interface TimelineEvent {
  year: number;
  event: string;
  type: string;
  details: string;
}

interface Amendment {
  id: string;
  actNumber: string;
  year: number;
  type: string;
  sectionsAmended: string[];
  summary: string;
  impactOnMeetings: string;
  impactRating: string;
  details: string;
  sourceUrl?: string;
}

function TimelineNode({ entry, amendment }: { entry: TimelineEvent; amendment?: Amendment }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`timeline-node timeline-node--${entry.type}`}>
      <div className="timeline-year">{entry.year}</div>
      <div
        className="card"
        style={{ cursor: amendment ? 'pointer' : 'default' }}
        onClick={() => amendment && setExpanded(!expanded)}
      >
        <div className="card__header" style={{ padding: '8px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {amendment && <span>{expanded ? '▼' : '▶'}</span>}
              <strong>{entry.event}</strong>
            </div>
            {amendment && <ImpactBadge impact={amendment.impactRating as any} />}
          </div>
          <div style={{ fontSize: '0.85em', color: 'gray', marginTop: '4px' }}>{entry.details}</div>
        </div>

        {expanded && amendment && (
          <div className="card__body" style={{ padding: '8px 12px', borderTop: '1px solid var(--ifm-color-emphasis-200)' }}>
            <table className="table table--striped" style={{ marginBottom: '8px' }}>
              <tbody>
                <tr><td><strong>Act Number</strong></td><td>{amendment.actNumber}</td></tr>
                <tr><td><strong>Type</strong></td><td>{amendment.type}</td></tr>
                <tr><td><strong>Sections Amended</strong></td><td>{amendment.sectionsAmended.join(', ')}</td></tr>
                <tr><td><strong>Impact on Meetings</strong></td><td>{amendment.impactOnMeetings}</td></tr>
                {amendment.sourceUrl && (
                  <tr><td><strong>Source</strong></td><td><a href={amendment.sourceUrl} target="_blank" rel="noopener noreferrer">{amendment.sourceUrl.endsWith('.pdf') ? 'View PDF' : 'View Source'}</a></td></tr>
                )}
              </tbody>
            </table>
            <p style={{ marginBottom: 0 }}>{amendment.details}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AmendmentTimeline() {
  const timeline = analysisData.timeline as TimelineEvent[];
  const amendments = analysisData.amendments as Amendment[];

  return (
    <div className="margin-vert--lg">
      <div className="amendment-timeline">
        {timeline.map((entry, i) => {
          const amendment = amendments.find((a) => a.year === entry.year);
          return <TimelineNode key={i} entry={entry} amendment={amendment} />;
        })}
      </div>
    </div>
  );
}
