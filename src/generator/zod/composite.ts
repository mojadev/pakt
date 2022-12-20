import { EcmaScriptImport, TypeScriptTypeComposition } from "../../model/generated-code-model";
import { CodeGenerator, Registry } from "../code-generator";
import { codeGenerator } from "../code-generator.decorator";
import { Writer } from "../writer";

@codeGenerator("composite")
export class ZodCompositeGenerator implements CodeGenerator<TypeScriptTypeComposition> {
  constructor(
    private registry: Registry,
    private zodImport: EcmaScriptImport = new EcmaScriptImport("zod").setDefaultImport("z")
  ) {}

  generate(model: TypeScriptTypeComposition, writer: Writer): Writer {
    writer.write(this.zodImport.defaultImport ?? "z").write(".union(");
    model.children.forEach((child, idx) => {
      this.registry.generateCode(child, writer);
      writer.conditionalWrite(idx !== model.children.length - 1, ", ");
    });
    writer.write(")");
    return writer;
  }
}
