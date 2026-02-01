export interface Target {
  url?: string;
  selector?: string;
}

export interface Request {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

export interface Response {
  status_code: number;
  headers: Record<string, string>;
  body_preview: string;
  body_full: string;
  body_size: number;
}

export interface Extraction {
  method: string;
  query: string;
  result: unknown;
  found: boolean;
}

export interface Action {
  id: string;
  timestamp: string;
  phase: string;
  action_type: string;
  target?: Target;
  request?: Request;
  response?: Response;
  extraction?: Extraction;
  duration_ms: number;
  status: 'success' | 'failure';
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface ValidationResult {
  check_name: string;
  passed: boolean;
  expected?: unknown;
  actual?: unknown;
  error?: string;
}

export interface DatasetSourceInfo {
  dataset_name: string;
  github_repo: string;
  file_path: string;
  raw_url: string;
  exists: boolean;
  columns: string[];
  row_count?: number;
  error?: string;
}

export interface UICheckResult {
  dataset_name: string;
  app_url: string;
  navigation_path: string[];
  visible: boolean;
  elements_found: Record<string, unknown>;
  data_displayed: boolean;
  ui_row_count?: number;
  ui_data_sample?: string[][];
  data_matches_source?: boolean;
  match_details?: {
    ui_row_count: number;
    source_row_count: number;
    rows_matched: number;
    values_matched?: string[];
    source_values?: string[];
    ui_values?: string[];
    sample_comparisons?: Array<{
      source_row: number;
      all_matched: boolean;
      values?: Array<{
        value: string;
        found_in_ui: boolean;
      }>;
    }>;
  };
  error?: string;
}

export interface DataIntegrityResult {
  dataset_name: string;
  data_url: string;
  accessible: boolean;
  valid_json: boolean;
  schema_valid: boolean;
  validations: ValidationResult[];
  row_count?: number;
  columns: string[];
  sample_data: Record<string, unknown>[];
  error?: string;
}

export interface DatasetResult {
  dataset_name: string;
  passed: boolean;
  source_discovery?: DatasetSourceInfo;
  app_visibility?: UICheckResult;
  data_integrity?: DataIntegrityResult;
}

export interface AuditConfig {
  datasets: string[];
  years: number[];
  phases: string[];
  app_url: string;
  platform?: string;
  name?: string;
  description?: string;
}

export interface AuditSummary {
  total_actions: number;
  successful: number;
  failed: number;
  datasets_total: number;
  datasets_passed: number;
  datasets_failed: number;
}

export interface AuditManifest {
  run_id: string;
  started_at: string;
  completed_at: string;
  config: AuditConfig;
  summary: AuditSummary;
}

export interface AuditReport {
  run_id: string;
  config: AuditConfig;
  summary: AuditSummary;
  datasets: DatasetResult[];
}

export interface AuditRun {
  id: string;
  manifest: AuditManifest;
  actions: Action[];
  report: AuditReport;
}
