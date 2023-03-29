import { pascalCase } from 'change-case';
import { RoutingModel } from '../../model';
import {
  EcmaScriptImport,
  TypeScriptDataStructure,
  TypeScriptInterface,
  TypeScriptTypeComposition,
} from '../../model/generated-code-model';
import { CodeGenerator, Registry } from '../code-generator';
import { codeGenerator } from '../code-generator.decorator';
import { generateCodeModelForType } from '../typescript/mapper';
import { Writer } from '../writer';
import { normalize } from './normalize';
import { ZodStringAsNumberGenerator } from './stringAsNumber';

@codeGenerator('router:raw')
export class ZodRouterModelGenerator implements CodeGenerator<RoutingModel> {
  private readonly importZodSymbol = new EcmaScriptImport('zod', true).setDefaultImport('z');
  /**
   * This is required for lazy schemas, as we need to give a type hint in these cases
   * A cleaner way would be to exclude the EcmaScriptImports from the nodes and include them in a second pass.
   */
  private readonly importTypes = new EcmaScriptImport('schemas').setNamespaceImport('types').setTypeOnly(true);

  private readonly customZodFunctions: Array<CodeGenerator<unknown>> = [
    new ZodStringAsNumberGenerator(this.importZodSymbol),
  ];

  constructor(private readonly registry: Registry) {}

  generate(model: RoutingModel, writer: Writer): Writer {
    this.registry.generateCode(this.importZodSymbol, writer);
    this.registry.generateCode(this.importTypes, writer);
    writer.blankLine();
    this.customZodFunctions.forEach((zodFunction) => zodFunction.generate(model, writer));
    this.generateExplicitTypeSchemas(model, writer);

    this.generatePathParamSchemas(model, writer);

    return writer;
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

  private generateExplicitTypeSchemas(model: RoutingModel, writer: Writer): void {
    normalize(model.types).forEach(([key, value]) => {
      const type = generateCodeModelForType(key, value);
      writer.write('export const ' + key + 'Schema = ');
      this.registry.generateCode(type, writer);
      writer.write(';');
      writer.blankLine();
    });
  }
}
