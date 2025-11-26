import { readFile } from 'fs';
import { promisify } from 'util';
import * as path from 'path';

//domain
import { CsvFileInterface } from '../../domain/interfaces/csv-file.interface';
import {
  RawInvoiceData,
  InvoiceStatus,
} from '../../domain/entities/invoice.entity';
import { ValidationError } from '../../domain/types';

const readFileAsync = promisify(readFile);

/**
 * Adapter to read, parse and validate CSV invoice files.
 */
export class CsvFileAdapter implements CsvFileInterface {
  private readonly VALID_STATUSES: InvoiceStatus[] = [
    'issued',
    'draft',
    'paid',
  ];
  private readonly baseDirectory: string;
  private readonly delimiter: string;

  constructor(baseDirectory: string = 'files', delimiter: string = ';') {
    this.baseDirectory = baseDirectory;
    this.delimiter = delimiter;
  }

  /**
   * Reads a CSV file and returns its parsed rows.
   *
   * @param {string} filename Name of the CSV file.
   * @returns {Promise<RawInvoiceData[]>} Parsed CSV data rows.
   */
  async read(filename: string): Promise<RawInvoiceData[]> {
    const filePath = path.join(this.baseDirectory, filename);
    const content = await readFileAsync(filePath, 'utf-8');
    return this.parseCsv(content);
  }

  /**
   * Validates a single CSV row.
   *
   * @param {RawInvoiceData} data Invoice values from a CSV row.
   * @returns {ValidationError[]} List of validation errors (empty if valid).
   */
  validate(data: RawInvoiceData): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!this.isPresent(data['Invoice Code'])) {
      errors.push({ property: 'code', message: 'required' });
    }
    if (!this.isPresent(data['Owner Name'])) {
      errors.push({ property: 'ownerName', message: 'required' });
    }
    if (!this.isPresent(data['Contact Name'])) {
      errors.push({ property: 'contactName', message: 'required' });
    }
    if (!this.isPresent(data['Issued Date'])) {
      errors.push({ property: 'issuedDate', message: 'required' });
    }

    if (!this.isValidStatus(data['Status'])) {
      errors.push({ property: 'status', message: 'invalid' });
    }

    if (!this.isValidNumber(data['Subtotal'])) {
      errors.push({ property: 'subtotal', message: 'invalid' });
    }
    if (!this.isValidNumber(data['Taxes'])) {
      errors.push({ property: 'taxes', message: 'invalid' });
    }
    if (!this.isValidNumber(data['Total'])) {
      errors.push({ property: 'total', message: 'invalid' });
    }

    return errors;
  }

  /**
   * Converts CSV text into structured rows.
   *
   * @param {string} content Full CSV file content.
   * @returns {RawInvoiceData[]} Parsed rows (excluding header).
   */
  private parseCsv(content: string): RawInvoiceData[] {
    const lines = this.getLines(content);
    if (lines.length === 0) return [];

    const headers = this.parseHeaders(lines[0]);
    const dataLines = lines.slice(1);

    return dataLines
      .filter((line) => line.trim() !== '')
      .map((line) => this.parseLine(line, headers));
  }

  /**
   * Splits CSV content into lines while cleaning CRLF.
   *
   * @param {string} content CSV text.
   * @returns {string[]} Individual cleaned lines.
   */
  private getLines(content: string): string[] {
    return content.split('\n').map((line) => line.replace(/\r$/, ''));
  }

  /**
   * Parses the CSV header line.
   *
   * @param {string} headerLine First line of the file.
   * @returns {string[]} Array of column names.
   */
  private parseHeaders(headerLine: string): string[] {
    return headerLine.split(this.delimiter).map((header) => header.trim());
  }

  /**
   * Parses a CSV row into a structured object.
   *
   * @param {string} line CSV row.
   * @param {string[]} headers CSV header names.
   * @returns {RawInvoiceData} Parsed invoice row.
   */
  private parseLine(line: string, headers: string[]): RawInvoiceData {
    const values = line.split(this.delimiter);

    return {
      'Invoice Code': this.getValueByHeader(headers, values, 'Invoice Code'),
      'Issued Date': this.getValueByHeader(headers, values, 'Issued Date'),
      'Owner Name': this.getValueByHeader(headers, values, 'Owner Name'),
      'Contact Name': this.getValueByHeader(headers, values, 'Contact Name'),
      Subtotal: this.getValueByHeader(headers, values, 'Subtotal'),
      Taxes: this.getValueByHeader(headers, values, 'Taxes'),
      Total: this.getValueByHeader(headers, values, 'Total'),
      Status: this.getValueByHeader(headers, values, 'Status'),
    };
  }

  /**
   * Returns a column value by header name.
   *
   * @param {string[]} headers Header names.
   * @param {string[]} values Values in the row.
   * @param {string} header Header to read.
   * @returns {string} Cell value (empty if missing).
   */
  private getValueByHeader(
    headers: string[],
    values: string[],
    header: string,
  ): string {
    const index = headers.indexOf(header);
    return index >= 0 ? values[index]?.trim() || '' : '';
  }

  /**
   * Checks if a string value is present.
   *
   * @param {string} value Value to check.
   * @returns {boolean} True if non-empty.
   */
  private isPresent(value: string): boolean {
    return value !== undefined && value !== null && value.trim() !== '';
  }

  /**
   * Checks if a value is a valid number.
   *
   * @param {string} value String representing a number.
   * @returns {boolean} True if numeric.
   */
  private isValidNumber(value: string): boolean {
    if (!this.isPresent(value)) return false;
    const num = parseFloat(value.trim());
    return !isNaN(num) && isFinite(num);
  }

  /**
   * Checks if the status value is one of the valid statuses.
   *
   * @param {string} status Status value.
   * @returns {boolean} True if valid.
   */
  private isValidStatus(status: string): boolean {
    return (
      this.isPresent(status) &&
      this.VALID_STATUSES.includes(status.trim() as InvoiceStatus)
    );
  }
}
