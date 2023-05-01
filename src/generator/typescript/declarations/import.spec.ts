import { EcmaScriptImport } from '../../../model';
import { expectSource } from '../../verify/source-assertions';
import { Writer } from '../../writer';
import { EcmaScriptImportGenerator } from './import';

describe('Import code generator', () => {
  const generator = new EcmaScriptImportGenerator();

  it('should generate default imports with the name defined in the models', () => {
    const importDefinition = new EcmaScriptImport('./path').setDefaultImport('defaultName');

    const sourceCode = generator.generate(importDefinition).toString();

    expect(sourceCode).toEqual('import defaultName from "./path";\n');
  });

  it('should import types on typeOnly imports', () => {
    const importDefinition = new EcmaScriptImport('./path').setDefaultImport('defaultName').setTypeOnly(true);

    const sourceCode = generator.generate(importDefinition).toString();

    expect(sourceCode).toEqual('import type defaultName from "./path";\n');
  });

  it('should generate named imports with the fields defined in the model', () => {
    const importDefinition = new EcmaScriptImport('./path').addNamedImports(['value1', 'value2']);

    const sourceCode = generator.generate(importDefinition).toString();

    expect(sourceCode).toEqual('import { value1, value2 } from "./path";\n');
  });

  it('should add both named and default imports if provided', () => {
    const importDefinition = new EcmaScriptImport('./path')
      .setDefaultImport('defaultName')
      .addNamedImports(['value1', 'value2']);

    const sourceCode = generator.generate(importDefinition).toString();

    expect(sourceCode).toEqual('import defaultName, { value1, value2 } from "./path";\n');
  });

  it('should import the whole module when no named and no default import is provided', () => {
    const importDefinition = new EcmaScriptImport('./path');

    const sourceCode = generator.generate(importDefinition).toString();

    expect(sourceCode).toEqual('import "./path";\n');
  });

  it('should import the whole module with a namespace when a namespace import is provided', () => {
    const importDefinition = new EcmaScriptImport('./path').setNamespaceImport('pathValues');

    const sourceCode = generator.generate(importDefinition).toString();

    expect(sourceCode).toEqual('import * as pathValues from "./path";\n');
  });

  it('should not create imports for paths to the same file', () => {
    const importDefinition = new EcmaScriptImport('./path');

    const writer = new Writer('path');
    const sourceCode = generator.generate(importDefinition, writer).toString();

    expect(() => expectSource(sourceCode).toContainImport('./')).toThrowError();
  });

  it('should not use relative paths for library imports', () => {
    const importDefinition = new EcmaScriptImport('path', true);

    const writer = new Writer('path');
    const sourceCode = generator.generate(importDefinition, writer).toString();

    expectSource(sourceCode).toContainImport('path');
  });
});
