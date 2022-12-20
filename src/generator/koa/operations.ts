import { pascalCase } from "change-case";
import { CodeGenerator, Registry } from "../code-generator";
import { codeGenerator } from "../code-generator.decorator";
import { identifyImports, simplifyImports } from "../typescript/mapper/identify-imports";
import { Writer } from "../writer";
import { EcmaScriptImport, RouterOperation, TypeScriptDataStructure } from "../../model/generated-code-model";

@codeGenerator("router:responses")
export class OperationTypeGenerator implements CodeGenerator<RouterOperation> {
  constructor(private readonly registry: Registry) {}

  generate(model: RouterOperation, writer = new Writer()): Writer {
    this.generateImports(model, writer);
    writer.blankLine();
    this.generateTypes(model, writer);
    this.generateResponseClasses(model, writer);
    return writer;
  }

  private generateImports(model: RouterOperation, writer: Writer) {
    const imports = simplifyImports(
      model
        .allResponses()
        .map((x) => x.payload as TypeScriptDataStructure)
        .filter(Boolean)

        .flatMap((payload: TypeScriptDataStructure) => identifyImports(payload))
    );

    imports.forEach((importDeclaration) => {
      this.registry.generateCode(importDeclaration, writer);
    });
    this.registry.generateCode(new EcmaScriptImport("api-types").addNamedImports(["ResponseTuple"]), writer);
  }

  private generateResponseClasses(model: RouterOperation, writer: Writer) {
    model.allResponses().forEach((response) => {
      const responseName = pascalCase("Response_" + response.mimeType + "_" + response.status);

      const payloadType = response.payload?.name || "void";
      // TODO: Implement TypeScriptClass object
      // Why: So we don't build classes inline here using string operations and inline Type References for imports
      writer
        .write("class ")
        .write(responseName)
        .write(" implements ApiOperation<")
        .write(payloadType)
        .write(">")
        .inlineBlock(() => {
          writer.write("public readonly status = ").write(String(response.status)).write(";").blankLine();
          writer.write("constructor(public readonly payload: ").write(payloadType).write(")").inlineBlock();
        })
        .blankLine();
    });
  }

  private generateTypes(model: RouterOperation, writer: Writer) {
    model.allResponses().forEach((response) => {
      if (!response.payload) {
        return;
      }
      const generator = this.registry.forModel(response.payload);
      if (!generator) {
        return;
      }
      generator.generate(response.payload, writer);
      writer.blankLine();
    });
  }
}
