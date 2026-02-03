import React, { useState } from 'react';
import auditSamplesData from '../data/audit-samples.json';

interface Validation {
    name: string;
    passed: boolean;
    message: string;
}

interface ActionAttempt {
    action: string;
    selector: string;
    status: string;
    error?: string;
}

interface SourceDiscoveryPhase {
    status: string;
    exists?: boolean;
    url?: string;
    columns?: string[];
    row_count?: number;
    duration_ms?: number;
    error?: string;
}

interface DataIntegrityPhase {
    status: string;
    validations?: Validation[];
    duration_ms?: number;
    reason?: string;
}

interface AppVisibilityPhase {
    status: string;
    visible?: boolean;
    navigation_path?: string[];
    table_found?: boolean;
    ui_row_count?: number;
    data_matches_source?: boolean;
    duration_ms?: number;
    error?: string;
    actions_attempted?: ActionAttempt[];
    reason?: string;
}

interface AuditSample {
    id: string;
    dataset: string;
    year: number;
    status: string;
    summary: {
        total_actions: number;
        successful: number;
        failed: number;
    };
    phases: {
        source_discovery: SourceDiscoveryPhase;
        data_integrity: DataIntegrityPhase;
        app_visibility: AppVisibilityPhase;
    };
}

function StatusBadge({ status }: { status: string }) {
    const isPass = status === 'pass';
    const isSkipped = status === 'skipped';

    if (isSkipped) {
        return (
            <span className="badge badge--secondary" style={{ marginLeft: '8px' }}>
                SKIPPED
            </span>
        );
    }

    return (
        <span
            className={`badge ${isPass ? 'badge--success' : 'badge--danger'}`}
            style={{ marginLeft: '8px' }}
        >
            {isPass ? 'PASS' : 'FAIL'}
        </span>
    );
}

function PhaseCard({
    title,
    phase,
    type
}: {
    title: string;
    phase: SourceDiscoveryPhase | DataIntegrityPhase | AppVisibilityPhase;
    type: 'source' | 'integrity' | 'visibility';
}) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className="card margin-bottom--sm"
            style={{
                border: phase.status === 'pass' ? '1px solid #4caf50' :
                        phase.status === 'fail' ? '1px solid #f44336' :
                        '1px solid #9e9e9e'
            }}
        >
            <div
                className="card__header"
                onClick={() => setExpanded(!expanded)}
                style={{ cursor: 'pointer', padding: '12px 16px' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '8px' }}>{expanded ? '▼' : '▶'}</span>
                        <strong>{title}</strong>
                        <StatusBadge status={phase.status} />
                    </div>
                    {'duration_ms' in phase && phase.duration_ms && (
                        <span style={{ fontSize: '0.85em', color: 'gray' }}>
                            {phase.duration_ms}ms
                        </span>
                    )}
                </div>
            </div>

            {expanded && (
                <div className="card__body" style={{ padding: '12px 16px' }}>
                    {type === 'source' && renderSourceDetails(phase as SourceDiscoveryPhase)}
                    {type === 'integrity' && renderIntegrityDetails(phase as DataIntegrityPhase)}
                    {type === 'visibility' && renderVisibilityDetails(phase as AppVisibilityPhase)}
                </div>
            )}
        </div>
    );
}

function renderSourceDetails(phase: SourceDiscoveryPhase) {
    if (phase.status === 'fail') {
        return (
            <div className="alert alert--danger">
                <strong>Error:</strong> {phase.error}
                <br />
                <small>URL: {phase.url}</small>
            </div>
        );
    }

    return (
        <div>
            <p><strong>URL:</strong> <code style={{ fontSize: '0.8em' }}>{phase.url}</code></p>
            <p><strong>Columns:</strong> {phase.columns?.join(', ')}</p>
            <p><strong>Row Count:</strong> {phase.row_count}</p>
        </div>
    );
}

function renderIntegrityDetails(phase: DataIntegrityPhase) {
    if (phase.status === 'skipped') {
        return (
            <div className="alert alert--secondary">
                <strong>Skipped:</strong> {phase.reason}
            </div>
        );
    }

    return (
        <div>
            <strong>Validations:</strong>
            <ul style={{ marginTop: '8px' }}>
                {phase.validations?.map((v, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>
                        <span style={{ color: v.passed ? '#4caf50' : '#f44336' }}>
                            {v.passed ? '✓' : '✗'}
                        </span>
                        {' '}<code>{v.name}</code>: {v.message}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function renderVisibilityDetails(phase: AppVisibilityPhase) {
    if (phase.status === 'skipped') {
        return (
            <div className="alert alert--secondary">
                <strong>Skipped:</strong> {phase.reason}
            </div>
        );
    }

    if (phase.status === 'fail') {
        return (
            <div>
                <div className="alert alert--danger" style={{ marginBottom: '12px' }}>
                    <strong>Error:</strong> {phase.error}
                </div>
                {phase.actions_attempted && (
                    <div>
                        <strong>Actions Attempted:</strong>
                        <ul style={{ marginTop: '8px' }}>
                            {phase.actions_attempted.map((a, i) => (
                                <li key={i} style={{ marginBottom: '4px' }}>
                                    <span style={{ color: a.status === 'success' ? '#4caf50' : '#f44336' }}>
                                        {a.status === 'success' ? '✓' : '✗'}
                                    </span>
                                    {' '}<code>{a.action}</code> on <code>{a.selector}</code>
                                    {a.error && <span style={{ color: '#f44336' }}> - {a.error}</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
            <p><strong>Navigation Path:</strong> {phase.navigation_path?.join(' → ')}</p>
            <p><strong>Table Found:</strong> {phase.table_found ? 'Yes' : 'No'}</p>
            <p><strong>UI Row Count:</strong> {phase.ui_row_count}</p>
            <p><strong>Data Matches Source:</strong> {phase.data_matches_source ? 'Yes' : 'No'}</p>
        </div>
    );
}

function AuditSampleCard({ sample }: { sample: AuditSample }) {
    const [expanded, setExpanded] = useState(false);
    const isPass = sample.status === 'pass';

    return (
        <div
            className="card margin-bottom--md"
            style={{
                border: isPass ? '2px solid #4caf50' : '2px solid #f44336',
                backgroundColor: isPass ? 'rgba(76, 175, 80, 0.05)' : 'rgba(244, 67, 54, 0.05)'
            }}
        >
            <div
                className="card__header"
                onClick={() => setExpanded(!expanded)}
                style={{ cursor: 'pointer' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <span style={{ marginRight: '8px', fontSize: '1.2em' }}>{expanded ? '▼' : '▶'}</span>
                        <strong>{sample.dataset}</strong>
                        <span
                            className={`badge ${isPass ? 'badge--success' : 'badge--danger'}`}
                            style={{ marginLeft: '12px', fontSize: '0.9em' }}
                        >
                            {isPass ? 'PASS' : 'FAIL'}
                        </span>
                    </div>
                    <div style={{ fontSize: '0.85em', color: 'gray' }}>
                        {sample.summary.successful}/{sample.summary.total_actions} actions
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="card__body">
                    <div style={{ marginBottom: '16px', padding: '8px', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '4px' }}>
                        <strong>Summary:</strong> {sample.summary.total_actions} total actions,
                        {' '}<span style={{ color: '#4caf50' }}>{sample.summary.successful} successful</span>,
                        {' '}<span style={{ color: sample.summary.failed > 0 ? '#f44336' : 'inherit' }}>{sample.summary.failed} failed</span>
                    </div>

                    <PhaseCard
                        title="Phase A: Source Discovery"
                        phase={sample.phases.source_discovery}
                        type="source"
                    />
                    <PhaseCard
                        title="Phase B: Data Integrity"
                        phase={sample.phases.data_integrity}
                        type="integrity"
                    />
                    <PhaseCard
                        title="Phase C: App Visibility"
                        phase={sample.phases.app_visibility}
                        type="visibility"
                    />
                </div>
            )}
        </div>
    );
}

export default function AuditSamples() {
    const samples = auditSamplesData.samples as AuditSample[];
    const passSamples = samples.filter(s => s.status === 'pass');
    const failSamples = samples.filter(s => s.status === 'fail');

    return (
        <div className="margin-vert--lg">
            <div className="row margin-bottom--md">
                <div className="col col--6">
                    <div className="badge badge--success" style={{ marginRight: '8px' }}>
                        {passSamples.length} Passing
                    </div>
                    <div className="badge badge--danger">
                        {failSamples.length} Failing
                    </div>
                </div>
            </div>

            <h3>Passing Audits</h3>
            <p style={{ color: 'gray', marginBottom: '16px' }}>
                These examples show successful audits where all three phases completed without errors.
            </p>
            {passSamples.map((sample) => (
                <AuditSampleCard key={sample.id} sample={sample} />
            ))}

            <h3 style={{ marginTop: '32px' }}>Failing Audits</h3>
            <p style={{ color: 'gray', marginBottom: '16px' }}>
                These examples demonstrate common failure scenarios: missing data sources and UI navigation issues.
            </p>
            {failSamples.map((sample) => (
                <AuditSampleCard key={sample.id} sample={sample} />
            ))}
        </div>
    );
}
