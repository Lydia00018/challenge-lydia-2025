//entities
import { RawInvoiceData } from '../entities/invoice.entity';

export interface CsvFileInterface {
  read(filename: string): Promise<RawInvoiceData[]>;
}
