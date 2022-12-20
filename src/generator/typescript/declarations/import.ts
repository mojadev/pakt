import { EcmaScriptImport } from "model";
import { CodeGenerator } from "generator/code-generator";
import { codeGenerator } from "generator/code-generator.decorator";
import { Writer } from "generator/writer";

@codeGenerator("import")
export class EcmaScriptImportGenerator implements CodeGenerator<EcmaScriptImport> {
  generate(ecmaImport: EcmaScriptImport, writer = new Writer()) {
    if (!ecmaImport.library && writer.isCurrentLocation(ecmaImport.path)) {
      return writer;
    }
    writer
      .write("import ")
      .conditionalWrite(Boolean(ecmaImport.namespaceImport), `* as ${ecmaImport.namespaceImport}`)
      .conditionalWrite(Boolean(ecmaImport.defaultImport), `${ecmaImport.defaultImport}`)
      .conditionalWrite(Boolean(ecmaImport.namedImports) && Boolean(ecmaImport.defaultImport), ", ")
      .conditionalWrite(Boolean(ecmaImport.namedImports), () => {
        return ["{", (ecmaImport.namedImports || []).join(", "), "}"].join(" ");
      })
      .conditionalWrite(
        Boolean(ecmaImport.namespaceImport) || Boolean(ecmaImport.namedImports) || Boolean(ecmaImport.defaultImport),
        " from "
      );
    if (ecmaImport.library) {
      writer.quote(ecmaImport.path).write(";").newLine();
    } else {
      writer.path(ecmaImport.path).write(";").newLine();
    }
    return writer;
  }
}
