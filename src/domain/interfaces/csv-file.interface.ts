//entities
import { RawInvoiceData } from '../entities/invoice.entity';

//types
import { ValidationError } from '../types';

export interface CsvFileInterface {
  read(filename: string): Promise<RawInvoiceData[]>;
  validate(data: RawInvoiceData): ValidationError[];
}
