export type InvoiceStatus = 'issued' | 'draft';

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

export interface Invoice {
  code: string;
  issuedDate: string;
  ownerName: string;
  contactName: string;
  subtotal: number;
  taxes: number;
  total: number;
  status: InvoiceStatus;
}
