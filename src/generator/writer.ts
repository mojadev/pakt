import { relative } from 'path/posix';
import { CodeBlockWriter } from 'ts-morph';

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
    let result = relative('/' + this.#location, '/' + target);
    if (!result.startsWith('.')) {
      result = './' + result;
    }
    if (result === './' + this.#location) {
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
