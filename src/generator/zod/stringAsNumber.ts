import { EcmaScriptImport } from "../../model/generated-code-model";
import { CodeGenerator } from "../code-generator";
import { Writer } from "../writer";
/**
 * Generator that creates a utility function for parsing strings as zod numbers.
 *
 */
export class ZodStringAsNumberGenerator implements CodeGenerator<unknown> {
  constructor(private zodImport: EcmaScriptImport = new EcmaScriptImport("zod").setDefaultImport("z")) {}

  generate(_model: unknown, writer: Writer): Writer {
    const zodSymbol = this.zodImport.defaultImport ?? "z";
    writer.write(`  const zStringAsNumber = ${zodSymbol}.preprocess((input: unknown) => {
  const processed = ${zodSymbol}.string().regex(/^\\d+$/).transform(Number).safeParse(input);
  return processed.success ? processed.data : input;
}, ${zodSymbol}.number());

`);
    return writer;
  }
}
