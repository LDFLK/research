import React, { useState, useMemo } from 'react';
import ecosystemData from '../data/ministry-health-ecosystem.json';
import { StatusBadge, AnalysisDepthBadge, KindBadge } from './StatusIndicator';

interface Amendment {
  actNumber: string;
  year: number;
}

interface Act {
  id: string;
  title: string;
  number: string;
  year: number;
  kind: { major: string; minor: string };
  status: string;
  analysisDepth: string;
  pdfUrl: string;
  domainCategory: string;
  summary: string;
  crossReferences: string[];
  amendments: Amendment[];
}

interface DomainCategory {
  id: string;
  label: string;
  color: string;
}

const { ministry, domainCategories, acts } = ecosystemData as {
  ministry: { name: string; gazetteReference: string; gazetteDate: string; country: string };
  domainCategories: DomainCategory[];
  acts: Act[];
};

function DomainTag({ categoryId }: { categoryId: string }) {
  const cat = domainCategories.find((c) => c.id === categoryId);
  if (!cat) return null;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.75em',
        fontWeight: 600,
        color: '#fff',
        backgroundColor: cat.color,
      }}
    >
      {cat.label}
    </span>
  );
}

function ActCard({ act, isExpanded, onToggle }: { act: Act; isExpanded: boolean; onToggle: () => void }) {
  const cat = domainCategories.find((c) => c.id === act.domainCategory);
  const borderColor = cat?.color || '#ccc';

  return (
    <div
      className="card margin-bottom--sm"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <div
        className="card__header"
        onClick={onToggle}
        style={{ cursor: 'pointer', padding: '12px 16px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ marginRight: '4px' }}>{isExpanded ? '▼' : '▶'}</span>
            <strong>{act.title}</strong>
            <span style={{ color: 'gray', fontSize: '0.85em' }}>{act.number}</span>
            <KindBadge kind={act.kind} />
            <AnalysisDepthBadge depth={act.analysisDepth as any} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DomainTag categoryId={act.domainCategory} />
            <span style={{ fontSize: '0.85em', color: 'gray' }}>{act.year}</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="card__body" style={{ padding: '12px 16px' }}>
          <p>{act.summary}</p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <StatusBadge status={act.status as any} />
          </div>

          {act.amendments.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <strong>Amendments:</strong>{' '}
              {act.amendments.map((a, i) => (
                <span key={i} className="badge badge--secondary" style={{ marginRight: '4px', marginBottom: '4px' }}>
                  {a.actNumber} ({a.year})
                </span>
              ))}
            </div>
          )}

          {act.crossReferences.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <strong>Cross-references:</strong>{' '}
              {act.crossReferences.map((ref, i) => {
                const refAct = acts.find((a) => a.id === ref);
                return (
                  <span key={i} className="badge badge--info" style={{ marginRight: '4px', marginBottom: '4px' }}>
                    {refAct ? refAct.title : ref}
                  </span>
                );
              })}
            </div>
          )}

          <div>
            <a href={act.pdfUrl} target="_blank" rel="noopener noreferrer" className="button button--sm button--outline button--primary">
              View Source
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MinistryOverview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredActs = useMemo(() => {
    return acts.filter((act) => {
      const matchesSearch =
        act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.summary.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDomain = selectedDomain === 'all' || act.domainCategory === selectedDomain;
      return matchesSearch && matchesDomain;
    });
  }, [searchTerm, selectedDomain]);

  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    acts.forEach((act) => {
      counts[act.domainCategory] = (counts[act.domainCategory] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="margin-vert--lg">
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '8px' }}>
        <strong>{ministry.name}</strong> &mdash; {ministry.gazetteReference} ({ministry.gazetteDate})
        <div style={{ marginTop: '4px' }}>
          <span className="badge badge--primary" style={{ marginRight: '8px' }}>{acts.length} Acts</span>
          <span className="badge badge--secondary">{acts.filter((a) => a.kind.minor === 'ordinance').length} Ordinances</span>
        </div>
      </div>

      <div className="row margin-bottom--md">
        <div className="col col--6">
          <input
            type="text"
            className="button button--outline button--secondary button--block"
            style={{ textAlign: 'left', cursor: 'text' }}
            placeholder="Search acts by title, number, or summary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col col--4">
          <select
            className="button button--outline button--secondary button--block"
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
          >
            <option value="all">All Domains ({acts.length})</option>
            {domainCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label} ({domainCounts[cat.id] || 0})
              </option>
            ))}
          </select>
        </div>
        <div className="col col--2">
          <div className="badge badge--primary">{filteredActs.length} shown</div>
        </div>
      </div>

      {filteredActs.map((act) => (
        <ActCard
          key={act.id}
          act={act}
          isExpanded={expandedId === act.id}
          onToggle={() => setExpandedId(expandedId === act.id ? null : act.id)}
        />
      ))}

      {filteredActs.length === 0 && (
        <div className="text--center margin-vert--xl">
          <p>No acts found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
