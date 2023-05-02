import { pascalCase } from 'change-case';
import path from 'node:path';
import logger from '../../logger';
import {
  BarrelExportDefinition,
  EcmaScriptImport,
  importModel,
  ReexportDefinition,
  RouterRawDefinition,
  RoutingModel,
  TypeModel,
  TypeScriptModule,
  TypeScriptTypeAlias,
} from '../../model';
import { ECMAScriptModuleGenerator, Registry } from '../code-generator';
import { SchemaFileGenerator } from '../schema';
import { addBaseTypeScriptGenerators } from '../typescript';
import { generateCodeModelForType } from '../typescript/mapper';
import { Writer } from '../writer';
import { setupGenerator } from '../zod';
import { ZodSchemaParserGenerator } from '../zod/schema-parser';
import { ModelGraphNode, TraversalContext } from './model-graph';

export class ModelOnlyRecipe {
  api: TypeScriptModule[] = [];

  typescriptGenerator = new Registry();
  validatorGenerator: ZodSchemaParserGenerator;
  graph: ModelGraphNode;

  constructor(
    private readonly model: RoutingModel,
    graph?: ModelGraphNode,
    private traverseContext: TraversalContext = {}
  ) {
    this.graph = graph || new ModelGraphNode(model);

    addBaseTypeScriptGenerators(this.typescriptGenerator);
    this.validatorGenerator = setupGenerator();

    logger.debug({ file: model.sourceFile }, '𐄳 Building dependency graph for document');
    this.buildDependencyGraph();
  }

  static fromFile(file: string, graph?: ModelGraphNode): ModelOnlyRecipe {
    return new ModelOnlyRecipe(importModel(file), graph);
  }

  /**
   * Extend the dependency graph with all references in the model.
   */
  private buildDependencyGraph() {
    const references: TypeScriptTypeAlias[] = Object.values(this.model.types)
      .flatMap((type) => this.getAllReferencesInModel(type))
      .map((type, i) => generateCodeModelForType(`ref_${i}`, type) as TypeScriptTypeAlias);
    const allReferencedFiles = Array.from(
      new Set(
        references.filter((reference) => reference.importSource).map((reference) => reference.importSource as string)
      )
    );
    logger.debug(
      { references: allReferencedFiles, file: this.model.sourceFile },
      'Cross document references in document'
    );
    allReferencedFiles.forEach((file) =>
      this.graph.addEdge(path.join(path.dirname(this.model.sourceFile), path.basename(file)))
    );
  }

  /**
   * Generate models and zod based schema validators for each model.
   *
   * @param prefix    A prefix to add to the folder (or location).
   * @returns
   */
  generateImplementation(prefix = ''): Record<string, string> {
    const schemaGenerator = new SchemaFileGenerator(this.typescriptGenerator);
    this.addImportsFromGraph(schemaGenerator);
    this.addImportsFromGraph(this.validatorGenerator);
    const schemas = schemaGenerator.generate(this.model, new Writer(`${prefix}/components/schemas`)).toString();
    const indexDefinition = new BarrelExportDefinition()
      .addExport(new ReexportDefinition(new EcmaScriptImport(`components/schemas`), 'Schema'))
      .addExport(new ReexportDefinition(new EcmaScriptImport(`components/parse-schemas`), 'SchemaParser'));

    const references = this.generateReferences();
    const files = {
      ...references,
      [`${prefix}index.ts`]: this.typescriptGenerator.generateCode(indexDefinition, new Writer()).toString(),
      [`${prefix}components/schemas.ts`]: schemas,
      [`${prefix}components/parse-schemas.ts`]: this.validatorGenerator
        .generate(new RouterRawDefinition(this.model), new Writer(`${prefix}/components/parse-schemas.ts`))
        .toString(),
    } as Record<string, string>;

    return files;
  }

  private addImportsFromGraph(schemaGenerator: ECMAScriptModuleGenerator) {
    Object.values(this.graph.findNode(this.model.shaSum)?.edges ?? {}).forEach(({ node }) => {
      const importName = path.basename(node.sourceFile, path.extname(node.sourceFile));
      if (node === this.graph.node) {
        return;
      }
      logger.debug({ namespace: pascalCase(importName), model: this.model.sourceFile }, 'Adding Import for model');

      const importDefinition = new EcmaScriptImport(
        this.graph.isStartNode(node) ? `/` : `../${importName}`
      ).setNamespaceImport(pascalCase(importName));
      schemaGenerator.addImport(importDefinition);
    });
  }

  /**
   * Generate models and schemas for referenced models, e.g. aliases from other files.
   *
   * These files are stored under subfolders and referenced in the alias implementation.
   */
  generateReferences(): Record<string, string> {
    let result = {};
    this.graph.traverse((edge) => {
      if (edge.context.startNode === edge) {
        return;
      }
      const prefix = `${path.basename(edge.node.sourceFile, path.extname(edge.node.sourceFile))}/`;
      result = {
        ...result,
        ...new ModelOnlyRecipe(edge.node, edge, this.traverseContext).generateImplementation(prefix),
      };
    }, this.traverseContext);
    return result;
  }

  getAllReferencesInModel = (type: TypeModel): TypeModel[] => {
    if (type.type === 'ref' && type.ref) {
      return [type];
    }
    const children = [...(type.children ?? []), ...Object.values(type.properties ?? {})];
    return children.flatMap((child) => this.getAllReferencesInModel(child));
  };
}
