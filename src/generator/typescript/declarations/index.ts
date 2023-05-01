import type { Registry } from '../../code-generator';
import { TypeScriptAliasFieldGenerator, TypeScriptAliasGenerator } from './alias';
import { TypeScriptClassGenerator } from './class';
import { TypeScriptCompositeFieldGenerator, TypeScriptCompositeGenerator } from './composite';
import { TypeScriptBarrelExportGenerator } from './export';
import { TypeScriptGenericFieldGenerator, TypeScriptGenericGenerator } from './generic';
import { EcmaScriptImportGenerator } from './import';
import {
  TypeScriptInterfaceFieldGenerator,
  TypeScriptInterfaceGenerator,
  TypeScriptObjectTypeDefinitionGenerator,
} from './interface';
import { TypeScriptLiteralFieldGenerator, TypeScriptLiteralGenerator } from './literal';

export const addBaseTypeScriptGenerators = (registry: Registry): void => {
  registry.add(new TypeScriptGenericGenerator(registry));
  registry.add(new TypeScriptCompositeGenerator(registry));
  registry.add(new TypeScriptCompositeFieldGenerator(registry));
  registry.add(new TypeScriptGenericFieldGenerator(registry));
  registry.add(new TypeScriptBarrelExportGenerator());
  registry.add(new TypeScriptClassGenerator(registry));
  registry.add(new EcmaScriptImportGenerator());
  registry.add(new TypeScriptInterfaceGenerator(registry));
  registry.add(new TypeScriptAliasFieldGenerator());
  registry.add(new TypeScriptAliasGenerator(registry));
  registry.add(new TypeScriptLiteralFieldGenerator());
  registry.add(new TypeScriptLiteralGenerator());
  registry.add(new TypeScriptInterfaceFieldGenerator(registry));
  registry.add(new TypeScriptObjectTypeDefinitionGenerator(registry));
};
