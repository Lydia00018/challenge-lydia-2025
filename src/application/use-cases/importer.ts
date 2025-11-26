// domain
import {
  Invoice,
  RawInvoiceData,
  InvoiceStatus,
} from '../../domain/entities/invoice.entity';
import { ImportResult, FailedInvoice } from '../../domain/types';
import { CsvFileInterface } from '../../domain/interfaces/csv-file.interface';

// infrastructure
import { CsvFileAdapter } from '../../infrastructure/adapters/csv-file.adapter';

/**
 * Handles the import process: reading CSV data, validating rows, and
 * converting them into Invoice entities.
 */
export class Importer {
  private readonly csvFile: CsvFileInterface;

  /**
   * @param {CsvFileInterface} [csvFile=new CsvFileAdapter('files',';')]
   * Adapter used to read and validate CSV data.
   */
  constructor(csvFile: CsvFileInterface = new CsvFileAdapter('files', ';')) {
    this.csvFile = csvFile;
  }

  /**
   * Imports a CSV file and returns valid invoices and validation errors.
   *
   * @param {string} filename Name of the CSV file to import.
   * @returns {Promise<ImportResult>} Result with ok invoices and ko errors.
   */
  async import(filename: string): Promise<ImportResult> {
    const rawInvoices = await this.csvFile.read(filename);
    return this.processInvoices(rawInvoices);
  }

  /**
   * Validates and transforms raw invoice rows.
   *
   * @param {RawInvoiceData[]} rawInvoices Raw rows from CSV.
   * @returns {ImportResult} Valid and invalid parsed rows.
   */
  private processInvoices(rawInvoices: RawInvoiceData[]): ImportResult {
    const ok: Invoice[] = [];
    const ko: FailedInvoice[] = [];

    rawInvoices.forEach((rawInvoice, index) => {
      const lineNumber = index + 2;
      const errors = this.csvFile.validate(rawInvoice);

      if (errors.length === 0) {
        ok.push(this.toInvoiceEntity(rawInvoice));
      } else {
        ko.push({ line: lineNumber, errors });
      }
    });

    return { ok, ko };
  }

  /**
   * Converts a raw CSV row into an Invoice entity.
   *
   * @param {RawInvoiceData} raw Raw invoice fields.
   * @returns {Invoice} Invoice entity.
   */
  private toInvoiceEntity(raw: RawInvoiceData): Invoice {
    return {
      code: raw['Invoice Code'].trim(),
      issuedDate: raw['Issued Date'].trim(),
      ownerName: raw['Owner Name'].trim(),
      contactName: raw['Contact Name'].trim(),
      subtotal: parseFloat(raw['Subtotal'].trim()),
      taxes: parseFloat(raw['Taxes'].trim()),
      total: parseFloat(raw['Total'].trim()),
      status: raw['Status'].trim() as InvoiceStatus,
    };
  }
}
