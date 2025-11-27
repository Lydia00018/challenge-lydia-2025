import { promises as fs } from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

//domain
import { CsvFileInterface } from '../../domain/interfaces/csv-file.interface';
import { RawInvoiceData } from '../../domain/entities/invoice.entity';

export class CsvFileAdapter implements CsvFileInterface {
  private readonly baseDirectory: string;
  private readonly delimiter: string;

  constructor(baseDirectory = 'files', delimiter = ';') {
    this.baseDirectory = baseDirectory;
    this.delimiter = delimiter;
  }

  async read(filename: string): Promise<RawInvoiceData[]> {
    const filePath = path.join(this.baseDirectory, filename);

    try {
      const content = await fs.readFile(filePath, 'utf8');

      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        delimiter: this.delimiter,
        relax_quotes: true,
        relax_column_count: true,
        cast: false,
      });

      return records as RawInvoiceData[];
    } catch (error) {
      const errorMsg =
        error instanceof Error ? `The ${filePath} couldn't be read due to: ${error.message}` : `The ${filePath} couldn't be read`;
      throw new Error(errorMsg);
    }
  }
}
