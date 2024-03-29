import { pascalCase } from 'change-case';
import { RoutingModel } from '../../model';
import {
  EcmaScriptImport,
  TypeScriptClassMethodModel,
  TypeScriptClassModel,
  TypeScriptDataStructure,
  TypeScriptInterface,
  TypeScriptTypeComposition,
} from '../../model/generated-code-model';
import { CodeGenerator, ECMAScriptModuleGenerator, Registry } from '../code-generator';
import { codeGenerator } from '../code-generator.decorator';
import { generateCodeModelForType } from '../typescript/mapper';
import { Writer } from '../writer';
import { normalize } from './normalize';
import { ZodStringAsNumberGenerator } from './stringAsNumber';

const zodImport = new EcmaScriptImport('zod', true).setDefaultImport('z');

@codeGenerator('router:raw')
export class ZodSchemaParserGenerator implements CodeGenerator<RoutingModel>, ECMAScriptModuleGenerator {
  private imports: EcmaScriptImport[] = [
    zodImport,
    /**
     * This is required for lazy schemas, as we need to give a type hint in these cases
     * A cleaner way would be to exclude the EcmaScriptImports from the nodes and include them in a second pass.
     **/
    new EcmaScriptImport('./schemas', true).setNamespaceImport('types').setTypeOnly(true),
  ];
  private readonly customZodFunctions: Array<CodeGenerator<unknown>> = [new ZodStringAsNumberGenerator(zodImport)];

  constructor(private readonly registry: Registry) {}

  addImport(importStatement: EcmaScriptImport) {
    this.imports.push(importStatement);
    return this;
  }

  generate(model: RoutingModel, writer: Writer): Writer {
    const parserClass = this.generateParserClass(model);
    this.imports.forEach((importDeclaration) => this.registry.generateCode(importDeclaration, writer));
    writer.blankLine();
    this.customZodFunctions.forEach((zodFunction) => zodFunction.generate(model, writer));
    writer.blankLine();

    this.registry.generateCode(parserClass, writer);
    this.generateExports(parserClass, writer);
    this.generatePathParamSchemas(model, writer);

    return writer;
  }

  generateExports(parserClass: TypeScriptClassModel, writer: Writer) {
    parserClass
      .getMethods()
      .map((method) => method.name)
      .forEach((alias) => {
        writer.write('export const ').write(alias).write(' = Schemas.').write(alias).write(';').newLine();
      });
  }

  private generateParserClass(model: RoutingModel) {
    const parserClass = new TypeScriptClassModel('Schemas');
    normalize(model.types).forEach(([key, value]) => {
      const schema = new TypeScriptClassMethodModel(`${key}Schema`, 'public').markAsGetter().markAsStatic();
      schema.withImplementation(
        `return ${this.registry.generateCode(generateCodeModelForType(key, value), new Writer()).toString()};`
      );
      parserClass.addMethod(schema);
    });
    return parserClass;
  }

  generatePathParamSchemas(model: RoutingModel, writer: Writer): void {
    Object.values(model.routerPaths).forEach((routerPath) => {
      const pathParams = new TypeScriptInterface('pathParams');
      const queryParams = new TypeScriptInterface('queryParams');
      const bodyPayload = new TypeScriptTypeComposition('requestBody', 'union');
      routerPath.pathParams?.forEach((pathParam) => {
        pathParams.addField(
          pathParam.name,
          generateCodeModelForType(pathParam.name, pathParam.type),
          pathParam.type.required
        );
      });
      routerPath.queryParams?.forEach((queryParam) => {
        queryParams.addField(
          queryParam.name,
          generateCodeModelForType(queryParam.name, queryParam.type),
          queryParam.type.required
        );
      });

      Object.entries(routerPath.requestBodies ?? {}).forEach(([key, body]) => {
        bodyPayload.addChild(generateCodeModelForType(key, body));
      });
      this.writeRequestPartSchema(writer, pascalCase(routerPath.operation + '-PathParameterSchema'), pathParams);
      this.writeRequestPartSchema(writer, pascalCase(routerPath.operation + '-QueryParameterSchema'), queryParams);
      if (bodyPayload.children.length) {
        this.writeRequestPartSchema(writer, pascalCase(routerPath.operation + '-BodyPayloadSchema'), bodyPayload);
      }
    });
  }

  private writeRequestPartSchema(writer: Writer, name: string, queryParams: TypeScriptDataStructure): void {
    writer.write('export const ').write(name).write(' = ');
    this.registry.generateCode(queryParams, writer);
    writer.write(';').blankLine();
  }
}
