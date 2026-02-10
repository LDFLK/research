import React from 'react';

type StatusType = 'active' | 'obsolete' | 'legally-active' | 'unknown';
type AnalysisDepth = 'deep' | 'catalog' | 'none';
type ImpactRating = 'high' | 'medium' | 'low' | 'none';
type ConfidenceLevel = 'high' | 'medium' | 'low';

const STATUS_CONFIG: Record<StatusType, { label: string; className: string }> = {
  'active': { label: 'Active', className: 'badge--success' },
  'legally-active': { label: 'Legally Active', className: 'badge--success' },
  'obsolete': { label: 'Obsolete', className: 'badge--danger' },
  'unknown': { label: 'Unknown', className: 'badge--secondary' },
};

const DEPTH_CONFIG: Record<AnalysisDepth, { label: string; className: string }> = {
  'deep': { label: 'Deep Analysis', className: 'badge--primary' },
  'catalog': { label: 'Cataloged', className: 'badge--secondary' },
  'none': { label: 'Not Analyzed', className: 'badge--warning' },
};

const IMPACT_CONFIG: Record<ImpactRating, { label: string; className: string }> = {
  'high': { label: 'High Impact', className: 'badge--danger' },
  'medium': { label: 'Medium Impact', className: 'badge--warning' },
  'low': { label: 'Low Impact', className: 'badge--secondary' },
  'none': { label: 'No Impact', className: 'badge--secondary' },
};

const CONFIDENCE_CONFIG: Record<ConfidenceLevel, { label: string; className: string }> = {
  'high': { label: 'High Confidence', className: 'badge--success' },
  'medium': { label: 'Medium Confidence', className: 'badge--warning' },
  'low': { label: 'Low Confidence', className: 'badge--danger' },
};

export function StatusBadge({ status }: { status: StatusType }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['unknown'];
  return <span className={`badge ${config.className}`}>{config.label}</span>;
}

export function AnalysisDepthBadge({ depth }: { depth: AnalysisDepth }) {
  const config = DEPTH_CONFIG[depth] || DEPTH_CONFIG['none'];
  return <span className={`badge ${config.className}`}>{config.label}</span>;
}

export function ImpactBadge({ impact }: { impact: ImpactRating }) {
  const config = IMPACT_CONFIG[impact] || IMPACT_CONFIG['none'];
  return <span className={`badge ${config.className}`}>{config.label}</span>;
}

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const config = CONFIDENCE_CONFIG[level] || CONFIDENCE_CONFIG['medium'];
  return <span className={`badge ${config.className}`}>{config.label}</span>;
}

export function KindBadge({ kind }: { kind: { major: string; minor: string } }) {
  const isOrdinance = kind.minor === 'ordinance';
  return (
    <span className={`badge ${isOrdinance ? 'badge--warning' : 'badge--info'}`}>
      {kind.minor === 'ordinance' ? 'Ordinance' : 'Act'}
    </span>
  );
}
