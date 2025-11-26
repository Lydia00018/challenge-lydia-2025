export type InvoiceStatus = 'issued' | 'draft' | 'paid';

export interface Invoice {
  readonly code: string;
  readonly issuedDate: string;
  readonly ownerName: string;
  readonly contactName: string;
  readonly subtotal: number;
  readonly taxes: number;
  readonly total: number;
  readonly status: InvoiceStatus;
}

export interface RawInvoiceData {
  'Invoice Code': string;
  'Issued Date': string;
  'Owner Name': string;
  'Contact Name': string;
  Subtotal: string;
  Taxes: string;
  Total: string;
  Status: string;
}
