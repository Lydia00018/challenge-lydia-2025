export interface ValidationError {
  readonly property: string;
  readonly message: 'required' | 'invalid';
}

export interface FailedInvoice {
  readonly line: number;
  readonly errors: ReadonlyArray<ValidationError>;
}

export interface ImportResult {
  readonly ok: ReadonlyArray<any>;
  readonly ko: ReadonlyArray<FailedInvoice>;
}
