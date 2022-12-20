import { iterateObject } from "../../iterate-object";
import { EcmaScriptImport, TypeScriptInterface } from "../../model/generated-code-model";
import { CodeGenerator, Registry } from "../code-generator";
import { codeGenerator } from "../code-generator.decorator";
import { Writer } from "../writer";

@codeGenerator("interface")
export class ZodInterfaceGenerator implements CodeGenerator<TypeScriptInterface> {
  constructor(
    private registry: Registry,
    private zodImport: EcmaScriptImport = new EcmaScriptImport("zod").setDefaultImport("z")
  ) {}

  generate(model: TypeScriptInterface, writer: Writer): Writer {
    writer
      .write(this.zodImport.defaultImport ?? "z")
      .write(".object(")
      .inlineBlock(() => {
        iterateObject(model.definition).forEach(([key, value]) => {
          writer.write(String(key)).write(": ");
          this.registry.generateCode(value, writer);
          writer.conditionalWrite(!value.required, ".optional()");
          writer.write(",");
          writer.newLine();
        });
      })
      .write(")");

    return writer;
  }
}
