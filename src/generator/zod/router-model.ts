import { pascalCase } from 'change-case';
import { RoutingModel } from '../../model';
import { EcmaScriptImport, TypeScriptInterface } from '../../model/generated-code-model';
import { CodeGenerator, Registry } from '../code-generator';
import { codeGenerator } from '../code-generator.decorator';
import { generateCodeModelForType } from '../typescript/mapper';
import { Writer } from '../writer';
import { normalize } from './normalize';
import { ZodStringAsNumberGenerator } from './stringAsNumber';

@codeGenerator('router:raw')
export class ZodRouterModelGenerator implements CodeGenerator<RoutingModel> {
  private readonly importZodSymbol = new EcmaScriptImport('zod', true).setDefaultImport('z');

  private readonly customZodFunctions: Array<CodeGenerator<unknown>> = [
    new ZodStringAsNumberGenerator(this.importZodSymbol),
  ];

  constructor(private readonly registry: Registry) {}

  generate(model: RoutingModel, writer: Writer): Writer {
    this.registry.generateCode(this.importZodSymbol, writer);
    writer.blankLine();
    this.customZodFunctions.forEach((zodFunction) => zodFunction.generate(model, writer));

    this.generatePathParamSchemas(model, writer);
    this.generateExplicitTypeSchemas(model, writer);

    return writer;
  }

  generatePathParamSchemas(model: RoutingModel, writer: Writer): void {
    Object.values(model.routerPaths).forEach((routerPath) => {
      const pathParams = new TypeScriptInterface('pathParams');
      const queryParams = new TypeScriptInterface('queryParams');
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

      this.writeRequestPartSchema(writer, pascalCase(routerPath.operation + '-PathParameterSchema'), pathParams);
      this.writeRequestPartSchema(writer, pascalCase(routerPath.operation + '-QueryParameterSchema'), queryParams);
    });
  }

  private writeRequestPartSchema(writer: Writer, name: string, queryParams: TypeScriptInterface): void {
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
