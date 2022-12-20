import { CodeBlockWriter } from "ts-morph";
import { relative, dirname } from "path/posix";

export class Writer {
  #writer: CodeBlockWriter;
  #location: string;

  constructor(location = "") {
    this.#writer = createWriter();
    this.#location = location;
  }

  get codeBlockWriter() {
    return this.#writer;
  }

  get write() {
    return this.#writer.write.bind(this.#writer);
  }

  get quote() {
    return this.#writer.quote.bind(this.#writer);
  }

  get writeLine() {
    return this.#writer.writeLine.bind(this.#writer);
  }

  get block() {
    return this.#writer.block.bind(this.#writer);
  }

  get inlineBlock() {
    return this.#writer.inlineBlock.bind(this.#writer);
  }

  get conditionalWrite() {
    return this.#writer.conditionalWrite.bind(this.#writer);
  }

  get space() {
    return this.#writer.space.bind(this.#writer);
  }

  get blankLine() {
    return this.#writer.blankLine.bind(this.#writer);
  }

  get newLine() {
    return this.#writer.newLine.bind(this.#writer);
  }

  get toString() {
    return this.#writer.toString.bind(this.#writer);
  }

  public isCurrentLocation(target: string) {
    let result = relative("/" + this.#location, "/" + target);
    return result.trim().length === 0;
  }

  public path(target: string) {
    let result = relative("/" + this.#location, "/" + target);
    if (!result.startsWith(".")) {
      result = "./" + result;
    }
    if (result === "./" + this.#location) {
      result = "./";
    }
    return this.#writer.quote(result);
  }
}

export const createWriter = () => {
  return new CodeBlockWriter({
    indentNumberOfSpaces: 2,
  });
};
