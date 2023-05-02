import logger from '../../logger';
import { importModel, RoutingModel } from '../../model';

class ModelGraphContext {
  allNodes: Record<string, ModelGraphNode> = {};

  constructor(public startNode: ModelGraphNode) {}
}

export class ModelGraphNode {
  /**
   * The edges of the graph, keyed by the shaSum of the model.
   */
  edges: Record<ContentSHASum, ModelGraphNode> = {};

  context: ModelGraphContext;

  constructor(public node: RoutingModel, context?: ModelGraphContext) {
    this.edges[node.shaSum] = this;
    this.context = context ?? new ModelGraphContext(this);
    this.context.allNodes[node.shaSum] = this;
  }

  /**
   * Adds an edge to the graph, if it doesn't already exist.
   *
   * @param fileName
   * @returns
   */
  addEdge(fileName: string): ModelGraphNode {
    const model = importModel(fileName);
    logger.debug({ fileName }, 'Adding model graph edge');
    if (!this.edges[model.shaSum]) {
      const node = this.context.allNodes[model.shaSum] ?? new ModelGraphNode(model, this.context);
      node.edges[this.node.shaSum] = this;
      this.edges[model.shaSum] = node;
    } else {
      logger.debug({ fileName }, 'Edge already exists');
    }
    return this.edges[model.shaSum];
  }

  /**
   * Execute the function in the first parameter for every edge in the graph that hasn't been visited yet.
   *
   * @param fn The function to  execute for every edge in the graph.
   * @param pass The pass number. If not given, the current pass is incremented by one.
   *             This is used to mark the nodes as visited in the current pass.
   */
  traverse(fn: (node: ModelGraphNode) => void, visitedNodes: TraversalContext = {}) {
    if (visitedNodes[this.node.shaSum]) {
      return;
    }
    visitedNodes[this.node.shaSum] = true;
    fn(this);
    Object.values(this.edges).forEach((edge) => edge.traverse(fn, visitedNodes));
  }

  findNode(name: string): ModelGraphNode | undefined {
    return this.context.allNodes[name];
  }

  hasEdges(): boolean {
    return Object.keys(this.edges).length > 1;
  }

  isStartNode(node: RoutingModel) {
    return this.context.startNode.node === node;
  }
}

type ContentSHASum = string;
export type TraversalContext = Record<string, boolean>;
