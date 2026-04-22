import type { WorkflowEdge, WorkflowNode } from "../types/workflow";

const START_X = 80;
const START_Y = 120;
const COLUMN_GAP = 280;
const ROW_GAP = 150;

export const autoLayoutNodes = (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
): WorkflowNode[] => {
  if (nodes.length === 0) {
    return nodes;
  }

  const incoming = new Map<string, number>();
  const adjacency = new Map<string, string[]>();
  const levels = new Map<string, number>();

  nodes.forEach((node) => {
    incoming.set(node.id, 0);
    adjacency.set(node.id, []);
    levels.set(node.id, 0);
  });

  edges.forEach((edge) => {
    if (!incoming.has(edge.target) || !adjacency.has(edge.source)) {
      return;
    }
    incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1);
    adjacency.get(edge.source)?.push(edge.target);
  });

  const queue = nodes
    .filter((node) => (incoming.get(node.id) ?? 0) === 0)
    .map((node) => node.id);
  const processed = new Set<string>();

  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (!nodeId || processed.has(nodeId)) {
      continue;
    }

    processed.add(nodeId);
    const currentLevel = levels.get(nodeId) ?? 0;

    for (const neighbor of adjacency.get(nodeId) ?? []) {
      const nextLevel = Math.max(levels.get(neighbor) ?? 0, currentLevel + 1);
      levels.set(neighbor, nextLevel);

      const nextIncoming = (incoming.get(neighbor) ?? 0) - 1;
      incoming.set(neighbor, nextIncoming);
      if (nextIncoming <= 0) {
        queue.push(neighbor);
      }
    }
  }

  // If the graph has cycles, place any unprocessed nodes after known levels.
  const maxKnownLevel = Math.max(...levels.values());
  nodes.forEach((node, index) => {
    if (!processed.has(node.id)) {
      levels.set(node.id, maxKnownLevel + 1 + index);
    }
  });

  const grouped = new Map<number, WorkflowNode[]>();
  nodes.forEach((node) => {
    const level = levels.get(node.id) ?? 0;
    const bucket = grouped.get(level) ?? [];
    bucket.push(node);
    grouped.set(level, bucket);
  });

  const orderedLevels = [...grouped.keys()].sort((a, b) => a - b);
  const positionById = new Map<string, { x: number; y: number }>();

  orderedLevels.forEach((level) => {
    const columnNodes = grouped.get(level) ?? [];
    columnNodes.forEach((node, rowIndex) => {
      positionById.set(node.id, {
        x: START_X + level * COLUMN_GAP,
        y: START_Y + rowIndex * ROW_GAP,
      });
    });
  });

  return nodes.map((node) => ({
    ...node,
    position: positionById.get(node.id) ?? node.position,
  }));
};
