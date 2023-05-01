import { importModel, RoutingModel } from '../../model';
import { ModelGraphNode } from './model-graph';

jest.mock('../../model', () => ({
  importModel: jest.fn((name) => ({
    shaSum: name,
  })),
}));

describe('ModelGraphNode', () => {
  let model: RoutingModel;

  beforeEach(() => {
    model = {
      shaSum: 'model-shaSum',
    } as RoutingModel;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should set the edges property', () => {
      const node = new ModelGraphNode(model);
      expect(node.edges).toEqual({
        'model-shaSum': node,
      });
    });
  });

  describe('addEdge', () => {
    it('should import the model file and add a new node if it does not already exist in the edges', () => {
      const startNode = new ModelGraphNode(model);
      const newNode = startNode.addEdge('file-name');
      expect(newNode).not.toBe(startNode);
      expect(newNode.node).toEqual({ shaSum: 'file-name' });
      expect(startNode.edges).toEqual({
        'model-shaSum': startNode,
        'file-name': newNode,
      });
      expect(newNode.edges).toEqual({
        'model-shaSum': startNode,
        'file-name': newNode,
      });
      expect(importModel).toHaveBeenCalledWith('file-name');
    });

    it('should return the existing node if it already exists in the edges', () => {
      const startNode = new ModelGraphNode(model);
      startNode.addEdge('file-name');
      startNode.addEdge('file-name');

      expect(importModel).toHaveBeenCalledTimes(2);
      expect(Object.keys(startNode.edges)).toEqual(['model-shaSum', 'file-name']);
    });

    it('should traverse every node on on the graph when calling traverse()', () => {
      const diamondGraph = new ModelGraphNode(model);
      diamondGraph.addEdge('test-node-1').addEdge('test-node-2');
      diamondGraph.addEdge('test-node-3').addEdge('test-node-2');

      const traverseFn = jest.fn();
      diamondGraph.traverse(traverseFn);

      expect(traverseFn).toHaveBeenCalledTimes(4);
    });

    it('should traverse idempotently when resetting after a traversal (though not async safe)', () => {
      const diamondGraph = new ModelGraphNode(model);
      diamondGraph.addEdge('test-node-1').addEdge('test-node-2');
      diamondGraph.addEdge('test-node-3').addEdge('test-node-2');

      const traverseFn = jest.fn();
      diamondGraph.traverse(traverseFn);
      diamondGraph.traverse(traverseFn);
      diamondGraph.traverse(traverseFn);

      expect(traverseFn).toHaveBeenCalledTimes(12);
    });

    it('should parse nodes circular graphs only once', () => {
      const diamondGraph = new ModelGraphNode(model);
      diamondGraph.addEdge('test-node-1').addEdge('test-node-3').addEdge('test-node-1');

      const traverseFn = jest.fn();
      diamondGraph.traverse(traverseFn);

      expect(traverseFn).toHaveBeenCalledTimes(3);
    });
  });
});
