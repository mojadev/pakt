import { BarrelExportDefinition, ReexportDefinition } from '../../../model';
import { CodeGenerator } from '../../code-generator';
import { codeGenerator } from '../../code-generator.decorator';
import { Writer } from '../../writer';

@codeGenerator('reexport')
export class TypeScriptExportGenerator implements CodeGenerator<ReexportDefinition> {
  generate(model: ReexportDefinition, writer: Writer) {
    writer
      .write('export * ')
      .conditionalWrite(Boolean(model.name), 'as ' + model.name)
      .write(' from ')
      .quote('./' + model.importDefinition.path)
      .write(';')
      .newLine();
    return writer;
  }
}

@codeGenerator('barrelExport')
export class TypeScriptBarrelExportGenerator implements CodeGenerator<BarrelExportDefinition> {
  exportGenerator = new TypeScriptExportGenerator();

  generate(model: BarrelExportDefinition, writer: Writer) {
    model.exports.forEach((exportDefinition) => this.exportGenerator.generate(exportDefinition, writer));
    return writer;
  }
}
