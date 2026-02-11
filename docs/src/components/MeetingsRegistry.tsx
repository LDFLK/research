import React, { useState, useMemo } from 'react';
import meetingsData from '../data/ministry-health-meetings.json';
import { StatusBadge } from './StatusIndicator';

interface MeetingRecord {
  body: string;
  act: string;
  actNumber: string;
  actYear: number;
  minister: string;
  sections: string;
  status: string;
  operationalStatus: string;
  frequency: string;
  convenedBy: string;
  chairperson: string;
  quorum: string;
  reporting: string;
  dissentMechanism: string;
  maxMembers: number | null;
}

const records = meetingsData as MeetingRecord[];

function GrayIfUnknown({ value }: { value: string | null }) {
  const unknown = !value || value === 'Unknown' || value.startsWith('Not specified');
  return (
    <span style={unknown ? { color: 'gray', fontStyle: 'italic' } : undefined}>
      {value ?? 'Unknown'}
    </span>
  );
}

export default function MeetingsRegistry() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAct, setSelectedAct] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMinister, setSelectedMinister] = useState('all');

  const distinctActs = useMemo(() => {
    const acts = new Set(records.map((r) => r.act));
    return Array.from(acts).sort();
  }, []);

  const distinctMinisters = useMemo(() => {
    const ministers = new Set(records.map((r) => r.minister));
    return Array.from(ministers).sort();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        r.body.toLowerCase().includes(term) ||
        r.act.toLowerCase().includes(term) ||
        r.actNumber.toLowerCase().includes(term) ||
        r.minister.toLowerCase().includes(term) ||
        r.chairperson.toLowerCase().includes(term) ||
        r.frequency.toLowerCase().includes(term) ||
        r.quorum.toLowerCase().includes(term) ||
        r.reporting.toLowerCase().includes(term) ||
        r.convenedBy.toLowerCase().includes(term);

      const matchesAct = selectedAct === 'all' || r.act === selectedAct;
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'active' && r.status === 'legally-active') ||
        (selectedStatus === 'obsolete' && r.status === 'obsolete');
      const matchesMinister = selectedMinister === 'all' || r.minister === selectedMinister;

      return matchesSearch && matchesAct && matchesStatus && matchesMinister;
    });
  }, [searchTerm, selectedAct, selectedStatus, selectedMinister]);

  return (
    <div className="margin-vert--lg">
      {/* Filters */}
      <div className="row margin-bottom--md" style={{ gap: '8px 0' }}>
        <div className="col col--4">
          <input
            type="text"
            className="button button--outline button--secondary button--block"
            style={{ textAlign: 'left', cursor: 'text' }}
            placeholder="Search body, act, chairperson, frequency..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col col--2">
          <select
            className="button button--outline button--secondary button--block"
            value={selectedMinister}
            onChange={(e) => setSelectedMinister(e.target.value)}
          >
            <option value="all">All Ministers</option>
            {distinctMinisters.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="col col--2">
          <select
            className="button button--outline button--secondary button--block"
            value={selectedAct}
            onChange={(e) => setSelectedAct(e.target.value)}
          >
            <option value="all">All Acts</option>
            {distinctActs.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="col col--2">
          <select
            className="button button--outline button--secondary button--block"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Legally Active</option>
            <option value="obsolete">Obsolete</option>
          </select>
        </div>
        <div className="col col--2">
          <span className="badge badge--primary">
            {filteredRecords.length} of {records.length} bodies
          </span>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="table table--striped">
          <thead>
            <tr>
              <th>Body</th>
              <th>Act</th>
              <th>Minister</th>
              <th>Status</th>
              <th>Frequency</th>
              <th>Chairperson</th>
              <th>Quorum</th>
              <th>Reporting</th>
              <th>Members</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((r, i) => (
              <tr key={i}>
                <td>
                  <strong>{r.body}</strong>
                  <br />
                  <span style={{ fontSize: '0.8em', color: 'gray' }}>{r.sections}</span>
                </td>
                <td>
                  {r.act}
                  <br />
                  <span style={{ fontSize: '0.8em', color: 'gray' }}>{r.actNumber}</span>
                </td>
                <td>{r.minister}</td>
                <td>
                  <StatusBadge status={r.status as any} />
                </td>
                <td><GrayIfUnknown value={r.frequency} /></td>
                <td><GrayIfUnknown value={r.chairperson} /></td>
                <td><GrayIfUnknown value={r.quorum} /></td>
                <td><GrayIfUnknown value={r.reporting} /></td>
                <td>{r.maxMembers ?? <GrayIfUnknown value="Unknown" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRecords.length === 0 && (
        <div className="text--center margin-vert--xl">
          <p>No statutory bodies match your criteria.</p>
        </div>
      )}
    </div>
  );
}
