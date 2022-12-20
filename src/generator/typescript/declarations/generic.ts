import { getModelType, TypeScriptGeneric } from "model";
import { CodeGenerator, Registry } from "generator/code-generator";
import { codeGenerator } from "generator/code-generator.decorator";
import { Writer } from "generator/writer";

@codeGenerator("generic")
export class TypeScriptGenericGenerator implements CodeGenerator<TypeScriptGeneric> {
  constructor(private readonly registry: Registry) {}

  generate(model: TypeScriptGeneric, writer = new Writer()): Writer {
    const typeGenerator = this.registry.entries["field:generic"];
    writer.conditionalWrite(model.exported, "export ").write("type ").write(model.name).write(" = ");
    if (!typeGenerator) {
      writer.write("unknown;");
      return writer;
    }
    return typeGenerator.generate(model, writer);
  }
}

@codeGenerator("field:generic")
export class TypeScriptGenericFieldGenerator implements CodeGenerator<TypeScriptGeneric> {
  constructor(private readonly registry: Registry) {}

  generate(model: TypeScriptGeneric, writer: Writer = new Writer()): Writer {
    const modelType = getModelType(model.templateType) || "";
    const generator = this.registry.entries["field:" + modelType];
    writer.write(model.genericName).write("<");
    if (!generator) {
      writer.write("unknown");
    } else {
      generator.generate(model.templateType, writer);
    }

    writer.write(">");
    return writer;
  }
}
