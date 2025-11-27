//infrastructure
import { CsvFileAdapter } from '../../infrastructure/adapters/csv-file.adapter';

//domain
import { CsvFileInterface } from '../../domain/interfaces/csv-file.interface';
import { ImportResult, FailedInvoice } from '../../domain/types';
import {
  Invoice,
  RawInvoiceData,
  InvoiceStatus,
} from '../../domain/entities/invoice.entity';
import { InvoiceValidator } from '../../domain/validators/invoice.validator';

export class Importer {
  private readonly csv: CsvFileInterface;
  private readonly validator = new InvoiceValidator();

  constructor(csvAdapter?: CsvFileInterface) {
    this.csv = csvAdapter ?? new CsvFileAdapter('files', ';');
  }

  async import(filename: string): Promise<ImportResult> {
    const ok: Invoice[] = [];
    const ko: FailedInvoice[] = [];

    try {
      const rawRows = await this.csv.read(filename);

      let line = 1;
      for (const raw of rawRows) {
        const errors = this.validator.validate(raw);

        if (errors.length === 0) {
          ok.push(this.parseInvoice(raw));
        } else {
          ko.push({ line, errors });
        }
        line++;
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `Failed to import ${filename}: ${error.message}`
          : 'Failed to import file';
      throw new Error(errorMsg);
    }

    return { ok, ko };
  }

  private parseInvoice(raw: RawInvoiceData): Invoice {
    return {
      code: raw['Invoice Code']?.trim() ?? '',
      issuedDate: raw['Issued Date']?.trim() ?? '',
      ownerName: raw['Owner Name']?.trim() ?? '',
      contactName: raw['Contact Name']?.trim() ?? '',
      subtotal: Number.parseFloat(raw.Subtotal ?? '0'),
      taxes: Number.parseFloat(raw.Taxes ?? '0'),
      total: Number.parseFloat(raw.Total ?? '0'),
      status: raw.Status?.trim().toLowerCase() as InvoiceStatus,
    };
  }
}
