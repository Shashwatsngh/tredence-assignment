import type {
  ValidationIssue,
  ValidationResult,
  WorkflowEdge,
  WorkflowNode,
} from "../types/workflow";

const hasConnection = (nodeId: string, edges: WorkflowEdge[]) =>
  edges.some((edge) => edge.source === nodeId || edge.target === nodeId);

const buildAdjacency = (nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
  const adjacency = new Map<string, string[]>();

  nodes.forEach((node) => adjacency.set(node.id, []));

  edges.forEach((edge) => {
    const next = adjacency.get(edge.source);
    if (next) {
      next.push(edge.target);
    }
  });

  return adjacency;
};

const hasCycle = (nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
  const adjacency = buildAdjacency(nodes, edges);
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (nodeId: string): boolean => {
    if (visiting.has(nodeId)) {
      return true;
    }

    if (visited.has(nodeId)) {
      return false;
    }

    visiting.add(nodeId);

    const neighbors = adjacency.get(nodeId) ?? [];
    for (const neighbor of neighbors) {
      if (visit(neighbor)) {
        return true;
      }
    }

    visiting.delete(nodeId);
    visited.add(nodeId);

    return false;
  };

  return nodes.some((node) => visit(node.id));
};

export const validateWorkflow = (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
): ValidationResult => {
  const issues: ValidationIssue[] = [];
  const startNodes = nodes.filter((node) => node.type === "start");
  const endNodes = nodes.filter((node) => node.type === "end");

  if (startNodes.length === 0) {
    issues.push({
      id: "missing-start",
      severity: "error",
      message: "Add a Start node to define the workflow entry point.",
    });
  }

  if (startNodes.length > 1) {
    issues.push({
      id: "multiple-starts",
      severity: "error",
      message: "Only one Start node is allowed.",
    });
  }

  if (startNodes.length === 1) {
    const [startNode] = startNodes;
    const incoming = edges.filter((edge) => edge.target === startNode.id);

    if (incoming.length > 0) {
      issues.push({
        id: "start-has-incoming",
        nodeId: startNode.id,
        severity: "error",
        message:
          "Start node must be the first node and cannot have incoming connections.",
      });
    }
  }

  if (endNodes.length === 0) {
    issues.push({
      id: "missing-end",
      severity: "warning",
      message: "Add an End node so the workflow has a clear exit.",
    });
  }

  nodes.forEach((node) => {
    if (!hasConnection(node.id, edges)) {
      issues.push({
        id: `isolated-${node.id}`,
        nodeId: node.id,
        severity: "warning",
        message: "This node is not connected to the workflow graph.",
      });
    }
  });

  if (hasCycle(nodes, edges)) {
    issues.push({
      id: "cycle",
      severity: "error",
      message:
        "The workflow contains a cycle. Remove the loop before simulation.",
    });
  }

  const danglingEdges = edges.filter(
    (edge) =>
      !nodes.some((node) => node.id === edge.source) ||
      !nodes.some((node) => node.id === edge.target),
  );

  danglingEdges.forEach((edge) => {
    issues.push({
      id: `dangling-${edge.id}`,
      edgeId: edge.id,
      severity: "error",
      message: "This edge references a missing node.",
    });
  });

  return {
    valid: !issues.some((issue) => issue.severity === "error"),
    issues,
  };
};

export const sortIssues = (issues: ValidationIssue[]) =>
  [...issues].sort((left, right) => {
    if (left.severity === right.severity) {
      return left.message.localeCompare(right.message);
    }

    return left.severity === "error" ? -1 : 1;
  });
