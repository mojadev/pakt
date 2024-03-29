import { pascalCase } from 'change-case';
import { CodeGenerator, Registry } from '../../code-generator';
import { codeGenerator } from '../../code-generator.decorator';
import { identifyImports } from '../../typescript/mapper/identify-imports';
import { Writer } from '../../writer';
import {
  EcmaScriptImport,
  RouterDefinition,
  RouterOperation,
  RouterOperationImplementation,
  TypeScriptDataStructure,
  TypeScriptGeneric,
  TypeScriptInterface,
  TypeScriptObjectTypeLiteral,
  TypeScriptTypeComposition,
} from '../../../model/generated-code-model';
/**
 * Koa router implementation.
 *
 * @TODO: This is a mess, especially the implementations.
 * For a first implementation it's ok, but the implementation should be more concise and testable.
 */
@codeGenerator('router')
export class KoaRouterGenerator implements CodeGenerator<RouterDefinition> {
  constructor(private readonly registry: Registry) {}

  generate(model: RouterDefinition, writer: Writer): Writer {
    // we use bracket notation for operations and I don't think it's worth
    // checking whether operations are valid typescript property names without
    // escaping.
    writer.writeLine('/* eslint-disable @typescript-eslint/dot-notation */');
    this.registry.generateCode(new EcmaScriptImport('api-types').setNamespaceImport('_ApiTypes'), writer);
    this.registry.generateCode(new EcmaScriptImport('koa-router', true).setDefaultImport('Router'), writer);
    this.registry.generateCode(new EcmaScriptImport('koa-bodyparser', true).setDefaultImport('bodyParser'), writer);
    this.registry.generateCode(this.createSchemaImport(model), writer);
    writer.blankLine();

    const interfaceDefinition = this.generateOperationPayloadInterface(model);
    identifyImports(interfaceDefinition).forEach((definition) => {
      this.registry.generateCode(definition, writer);
    });
    this.registry.generateCode(interfaceDefinition, writer);
    this.generateRegistryImplementation(model, writer);
    this.generatePathImplementation(model, writer);
    return writer;
  }

  private generateOperationPayloadInterface(model: RouterDefinition): TypeScriptObjectTypeLiteral {
    const returnTypeInterface = new TypeScriptInterface('ApiDefinition');
    if (!model.operations) {
      return returnTypeInterface;
    }
    model.operations.forEach((operation) => {
      const subType = new TypeScriptInterface(operation.name);
      returnTypeInterface.addField(operation.name, subType, true);

      operation.implementations.forEach((implementation) => {
        subType.addField(
          implementation.mimeType,
          new TypeScriptTypeComposition('apiOperation', 'intersection')
            .addChild(
              new TypeScriptGeneric('string', '_ApiTypes.ApiOperation', [
                new TypeScriptGeneric('response', '_ApiTypes.Response', [
                  operation.responseInterface(implementation.mimeType),
                ]),
              ])
            )
            .addChildIf(() => implementation.params.length > 0, this.generateParamsInterface(implementation))
            .addChildIf(() => implementation.queryParams.length > 0, this.generateQueryParamsInterface(implementation))
            .addChildIf(
              () => implementation.requestBody !== undefined && implementation.requestBody.length > 0,
              this.generateRequestBodyInterface(implementation)
            ),
          true
        );
      });
    });
    return returnTypeInterface;
  }
  generateRequestBodyInterface(implementation: RouterOperationImplementation): TypeScriptDataStructure {
    const interfaceDefinition = new TypeScriptTypeComposition('body', 'union', true);
    (implementation.requestBody ?? []).forEach((body) => {
      interfaceDefinition.addChild(body.payload);
    });

    return new TypeScriptGeneric('string', '_ApiTypes.Body', [interfaceDefinition]);
  }

  private generateParamsInterface(implementation: RouterOperationImplementation): TypeScriptDataStructure {
    const interfaceDefinition = new TypeScriptInterface('params', true);
    implementation.params.forEach((param) => {
      interfaceDefinition.addField(param.name, param.type, true);
    });

    return new TypeScriptGeneric('string', '_ApiTypes.PathParams', [interfaceDefinition]);
  }

  private generateQueryParamsInterface(implementation: RouterOperationImplementation): TypeScriptDataStructure {
    const interfaceDefinition = new TypeScriptInterface('query', true);
    implementation.queryParams.forEach((param) => {
      interfaceDefinition.addField(param.name, param.type, param.required);
    });

    return new TypeScriptGeneric('string', '_ApiTypes.QueryParams', [interfaceDefinition]);
  }

  private createSchemaImport(model: RouterDefinition): EcmaScriptImport {
    const ecmaImport = new EcmaScriptImport('components/parse-schemas');

    function getImportSymbols(
      filter: ({ implementation }: { implementation: RouterOperationImplementation }) => boolean
    ): string[] {
      return Object.keys(
        (model.operations ?? [])
          .flatMap((operation) => operation.implementations.map((implementation) => ({ implementation, operation })))
          .filter(filter)
          .reduce((prev, { operation }) => ({ ...prev, [operation.name]: true }), {})
      );
    }
    const paramImports = getImportSymbols(({ implementation }) => implementation.params.length > 0).map((x) =>
      createPathParamSchemaName({ name: x })
    );
    const queryImports = getImportSymbols(({ implementation }) => implementation.queryParams.length > 0).map((x) =>
      createQueryParamSchemaName({ name: x })
    );
    const bodyParamImport = getImportSymbols(({ implementation }) => (implementation.requestBody ?? []).length > 0).map(
      (x) => createBodyPayloadSchemaName({ name: x })
    );

    ecmaImport.addNamedImports(paramImports);
    ecmaImport.addNamedImports(queryImports);
    ecmaImport.addNamedImports(bodyParamImport);

    return ecmaImport;
  }

  private generateRegistryImplementation(model: RouterDefinition, writer: Writer): void {
    if (!model.operations) {
      return;
    }

    writer.writeLine('// eslint-disable-next-line @typescript-eslint/explicit-function-return-type');
    writer.writeLine('const createRegistry = () => ').inlineBlock(() => {
      writer.writeLine('const registry = ').inlineBlock(() => {
        model.operations.forEach((operation) => {
          writer
            .quote(operation.name)
            .write(': ')
            .inlineBlock(() => {
              operation.implementations.forEach((impl) => {
                const params = `_ApiTypes.ApiPayload<ApiDefinition["${operation.name}"]["${impl.mimeType}"]>`;
                const response = `Promise<_ApiTypes.ApiResponse<ApiDefinition["${operation.name}"]["${impl.mimeType}"]>>`;
                writer
                  .quote(impl.mimeType)
                  .write(': (params: ')
                  .write(params)
                  .write('): ')
                  .write(response)
                  .write(' => ')
                  .inlineBlock(() => {
                    writer.write('throw new Error("not implemented")');
                  });
                writer.write(',');
                writer.newLine();
              });
            });

          writer.write(',');
          writer.newLine();
        });
      });
      writer.blankLine().write(registerOperationSnippet);
    });
    writer.blankLine();
  }

  private generatePathImplementation(model: RouterDefinition, writer: Writer): void {
    if (!model.operations) {
      return;
    }
    writer.writeLine('export const registry = createRegistry();');
    writer.writeLine('export const router = new Router();');

    model.operations.forEach((operation) => {
      writer
        .write('router.')
        .write(operation.method)
        .write('(')
        .quote(operation.path.replace(/\{(.*)\}/g, ':$1'))
        .conditionalWrite(hasRequestBody(operation), ', ' + getBodyParser(operation))
        .write(', async (ctx, next) => ')
        .inlineBlock(() => writer.write(apiCallSnippet(operation)))
        .write(');')
        .blankLine();
    });
  }
}

const apiCallSnippet = (operation: RouterOperation): string =>
  `
${determineMimeType(operation)}
${generatePayload(operation)}
`;

const registerOperationSnippet = `
  return {
    register<
      Operation extends keyof typeof registry & keyof ApiDefinition,
      MimeType extends keyof typeof registry[Operation] & keyof ApiDefinition[Operation]
    >(
      operation: Operation,
      mimeType: MimeType,
      request: (
        args: _ApiTypes.ApiPayload<ApiDefinition[Operation][MimeType]>
      ) => Promise<_ApiTypes.ApiResponse<ApiDefinition[Operation][MimeType]>> | _ApiTypes.ApiResponse<ApiDefinition[Operation][MimeType]>
    ) {
      registry[operation] = registry[operation] ?? {};
      registry[operation][mimeType] = request as unknown as typeof registry[Operation][MimeType];
    },
    get() {
      return registry;
    },
  };
`;

const generatePayload = (routerOperation: RouterOperation): string => {
  const cases: string[] = [];

  const pathImport = `const pathParams = ${createPathParamSchemaName(routerOperation)}.parse(ctx.params);\n`;
  const queryParamImport = `const queryParams = ${createQueryParamSchemaName(routerOperation)}.parse(ctx.query);\n`;
  const bodyParamImport = `const bodyPayload = ${createBodyPayloadSchemaName(
    routerOperation
  )}.parse(ctx.request.body);\n`;

  routerOperation.implementations.forEach((implementation) => {
    let caseEntry = `     case "${implementation.mimeType}":\n`;
    caseEntry += `        result = await registry.get()["${routerOperation.name}"]["${
      implementation.mimeType
    }"](${generateApiPayload(implementation)});`;
    cases.push(caseEntry);
  });
  return `
  ${routerOperation.implementations.some((x) => x.params.length > 0) ? pathImport : ''}
  ${routerOperation.implementations.some((x) => x.queryParams.length > 0) ? queryParamImport : ''}
  ${routerOperation.implementations.some((x) => (x.requestBody ?? []).length > 0) ? bodyParamImport : ''}
  let result: {body?: unknown, headers?: Record<string, string>, status?: number} = {};
  switch(mimeType) {
${cases.join('\nbreak;\n')}
  }
  
  ctx.body = result.body;
  ctx.set(result.headers ?? {});
  ctx.status = result.status ?? 404;
  next();
  `;
};

const generateApiPayload = (implementation: RouterOperationImplementation): string => {
  const fields: string[] = [];
  if (implementation.params.length > 0) {
    fields.push('path: pathParams');
  }
  if (implementation.queryParams.length > 0) {
    fields.push('query: queryParams');
  }
  if ((implementation.requestBody ?? []).length) {
    fields.push('body: bodyPayload');
  }
  return `{
    ${fields.join(',\n')}
  }`;
};

const determineMimeType = (routerOperation: RouterOperation): string => {
  const mimeTypes = Object.keys(
    routerOperation.allResponses().reduce((result, response) => ({ ...result, [response.mimeType]: true }), {})
  ).join('", "');

  return `
  const mimeType = ctx.accepts(["${mimeTypes}"]);
  if (!mimeType) {
    ctx.response.status = 406;
    ctx.response.body = "";
    return;
  }`;
};

const createPathParamSchemaName = ({ name }: { name: string }): string => {
  return pascalCase(name + '-' + 'PathParameterSchema');
};

const createQueryParamSchemaName = ({ name }: { name: string }): string => {
  return pascalCase(name + '-' + 'QueryParameterSchema');
};

const createBodyPayloadSchemaName = ({ name }: { name: string }): string => {
  return pascalCase(name + '-' + 'BodyPayloadSchema');
};

const hasRequestBody = (operation: RouterOperation): boolean => {
  const implementation = operation.implementations[0];
  if (!implementation) {
    return false;
  }
  return implementation.requestBody !== undefined && implementation.requestBody.length > 0;
};

const getBodyParser = (operation: RouterOperation): string => {
  const mimeTypes = operation.implementations[0].requestBody?.map((x) => x.mimeType) || [];
  const types = ['text', 'xml', 'form', 'json'].filter((x) =>
    mimeTypes.some((mimeType) => mimeType.includes(x) || x.includes('*'))
  );
  if (types.length === 0) {
    return 'bodyParser()';
  }
  return `bodyParser({enableTypes: ['${types.join(',')}']})`;
};
