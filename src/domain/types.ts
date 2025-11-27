import { Invoice } from './entities/invoice.entity';

export interface ValidationError {
  readonly property: keyof Invoice;
  readonly message: 'required' | 'invalid';
}

export interface FailedInvoice {
  readonly line: number;
  readonly errors: ValidationError[];
}

export interface ImportResult {
  readonly ok: Invoice[];
  readonly ko: FailedInvoice[];
}