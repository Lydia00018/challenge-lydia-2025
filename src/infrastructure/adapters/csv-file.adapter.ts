import { promises as fs } from 'fs';
import * as path from 'path';

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

    let content: string;
    try {
      content = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Internal Server Error';
      throw new Error(`The ${filePath} couldn't be read due to: ${errorMsg}`);
    }

    const lines = content
      .split('\n')
      .map((l) => l.replace(/\r$/, ''))
      .filter((l) => l.trim() !== '');
    if (lines.length === 0) return [];

    const headerLine = lines[0];
    const headers = headerLine.split(this.delimiter).map((h) => h.trim());

    const dataLines = lines.slice(1).filter((l) => l.trim() !== '');

    const rows: RawInvoiceData[] = [];

    for (const line of dataLines) {
      const values = line.split(this.delimiter);
      const obj: any = {};

      let i = 0;
      for (const h of headers) {
        obj[h] = values[i] !== undefined ? values[i].trim() : '';
        i++;
      }

      rows.push(obj as RawInvoiceData);
    }

    return rows;
  }
}
