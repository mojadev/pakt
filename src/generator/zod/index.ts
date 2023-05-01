import { Registry } from '../code-generator';
import {
  EcmaScriptImportGenerator,
  TypeScriptAliasFieldGenerator,
  TypeScriptGenericFieldGenerator,
} from '../typescript';
import { TypeScriptClassGenerator } from '../typescript/declarations/class';
import { ZodAliasGenerator } from './alias';
import { ZodCompositeGenerator } from './composite';
import { ZodGenericGenerator } from './generic';
import { ZodInterfaceGenerator } from './interface';
import { ZodLiteralGenerator } from './literal';
import { ZodSchemaParserGenerator } from './schema-parser';

export const setupGenerator = (): ZodSchemaParserGenerator => {
  const validatorSchemaRegistry = new Registry();

  validatorSchemaRegistry.add(new EcmaScriptImportGenerator());
  validatorSchemaRegistry.add(new ZodAliasGenerator());
  validatorSchemaRegistry.add(new ZodCompositeGenerator(validatorSchemaRegistry));
  validatorSchemaRegistry.add(new TypeScriptClassGenerator(validatorSchemaRegistry));
  validatorSchemaRegistry.add(new TypeScriptGenericFieldGenerator(validatorSchemaRegistry));
  validatorSchemaRegistry.add(new TypeScriptAliasFieldGenerator());
  validatorSchemaRegistry.add(new ZodInterfaceGenerator(validatorSchemaRegistry));

  validatorSchemaRegistry.add(new ZodGenericGenerator(validatorSchemaRegistry));
  validatorSchemaRegistry.add(new ZodLiteralGenerator());

  const schemaParserGenerator = new ZodSchemaParserGenerator(validatorSchemaRegistry);
  validatorSchemaRegistry.add(schemaParserGenerator);
  return schemaParserGenerator;
};
