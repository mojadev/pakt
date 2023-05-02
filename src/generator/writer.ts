import { basename, dirname, relative } from 'path/posix';
import { CodeBlockWriter } from 'ts-morph';
import logger from '../logger';

export class Writer {
  #writer: CodeBlockWriter;
  #location: string;

  constructor(location = '') {
    this.#writer = createWriter();
    this.#location = location;
  }

  get codeBlockWriter(): CodeBlockWriter {
    return this.#writer;
  }

  get write(): (text: string) => CodeBlockWriter {
    return this.#writer.write.bind(this.#writer);
  }

  get quote(): (text: string) => CodeBlockWriter {
    return this.#writer.quote.bind(this.#writer);
  }

  get writeLine(): (text: string) => CodeBlockWriter {
    return this.#writer.writeLine.bind(this.#writer);
  }

  get block(): (block?: () => void) => CodeBlockWriter {
    return this.#writer.block.bind(this.#writer);
  }

  get inlineBlock(): (block?: () => void) => CodeBlockWriter {
    return this.#writer.inlineBlock.bind(this.#writer);
  }

  get conditionalWrite(): (condition: boolean | undefined, text: (() => string) | string) => CodeBlockWriter {
    return this.#writer.conditionalWrite.bind(this.#writer) as (
      condition: boolean | undefined,
      text: (() => string) | string
    ) => CodeBlockWriter;
  }

  get space(): () => CodeBlockWriter {
    return this.#writer.space.bind(this.#writer);
  }

  get blankLine(): () => CodeBlockWriter {
    return this.#writer.blankLine.bind(this.#writer);
  }

  get newLine(): () => CodeBlockWriter {
    return this.#writer.newLine.bind(this.#writer);
  }

  get toString(): () => string {
    return this.#writer.toString.bind(this.#writer);
  }

  public isCurrentLocation(target: string): boolean {
    const result = relative('/' + this.#location, '/' + target);
    return result.trim().length === 0;
  }

  public path(target: string): CodeBlockWriter {
    let writerLocation = this.#location;
    let file: string | null = null;
    if (!this.#location.endsWith('/')) {
      writerLocation = dirname(this.#location);
      file = basename(this.#location);
    }
    let result = relative('/' + writerLocation, '/' + target);
    logger.trace({ writerLocation: this.#location, target, result }, 'Resolving path');
    if (!result.startsWith('.')) {
      result = './' + result;
    }
    if (file && result === './' + file) {
      result = './';
    }
    return this.#writer.quote(result);
  }
}

export const createWriter = (): CodeBlockWriter => {
  return new CodeBlockWriter({
    indentNumberOfSpaces: 2,
  });
};
