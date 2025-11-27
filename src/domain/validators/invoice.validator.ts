//entities
import { RawInvoiceData, InvoiceStatus } from '../entities/invoice.entity';

//types
import { ValidationError } from '../types';

export class InvoiceValidator {
  private readonly VALID_STATUSES: InvoiceStatus[] = ['issued', 'draft'];

  validate(raw: RawInvoiceData): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!raw['Invoice Code']?.trim()) {
      errors.push({ property: 'code', message: 'required' });
    }

    if (!raw['Owner Name']?.trim()) {
      errors.push({ property: 'ownerName', message: 'required' });
    }

    if (!raw['Issued Date']?.trim()) {
      errors.push({ property: 'issuedDate', message: 'required' });
    }

    if (!raw['Status'] || !this.VALID_STATUSES.includes(raw['Status'].trim() as InvoiceStatus)) {
      errors.push({ property: 'status', message: 'invalid' });
    }

    if (!this.isValidNumber(raw['Subtotal'])) {
      errors.push({ property: 'subtotal', message: 'invalid' });
    }

    if (!this.isValidNumber(raw['Taxes'])) {
      errors.push({ property: 'taxes', message: 'invalid' });
    }

    if (!this.isValidNumber(raw['Total'])) {
      errors.push({ property: 'total', message: 'invalid' });
    }

    return errors;
  }

  private isValidNumber(value?: string): boolean {
    if (!value) return false;
    const n = parseFloat(value.trim());
    return !Number.isNaN(n) && Number.isFinite(n);
  }
}
