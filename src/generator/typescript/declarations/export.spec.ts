import { BarrelExportDefinition, EcmaScriptImport, ReexportDefinition } from '../../../model';
import { expectSource } from '../../verify/source-assertions';
import { Writer } from '../../writer';
import { TypeScriptBarrelExportGenerator, TypeScriptExportGenerator } from './export';

describe('Export definition generator', () => {
  const generator = new TypeScriptExportGenerator();

  it("should create an export * as name from './import' reexport in typescript", () => {
    const definition = new ReexportDefinition(new EcmaScriptImport('test'), 'exportName');

    const result = generator.generate(definition, new Writer()).toString();

    expectSource(result).toReExport('./test').withName('exportName');
  });
});

describe('Barrel Export definition generator', () => {
  const generator = new TypeScriptBarrelExportGenerator();

  it('should create an export for each value in the barrel definition', () => {
    const definition = new BarrelExportDefinition();
    definition
      .addExport(new ReexportDefinition(new EcmaScriptImport('test'), 'exportName'))
      .addExport(new ReexportDefinition(new EcmaScriptImport('test2'), 'exportName2'));

    const result = generator.generate(definition, new Writer()).toString();

    expectSource(result).toReExport('./test').withName('exportName');
    expectSource(result).toReExport('./test2').withName('exportName2');
  });
});
