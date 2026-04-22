import {
  isWorkflowNodeType,
  type WorkflowEdge,
  type WorkflowNode,
  type WorkflowNodeData,
  type WorkflowSnapshot,
} from "../types/workflow";

export const serializeWorkflow = (workflow: WorkflowSnapshot) =>
  JSON.stringify(workflow, null, 2);

export const downloadWorkflow = (
  workflow: WorkflowSnapshot,
  fileName: string,
) => {
  const blob = new Blob([serializeWorkflow(workflow)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
};

export const parseWorkflow = (raw: string): WorkflowSnapshot => {
  const parsed = JSON.parse(raw) as Partial<WorkflowSnapshot>;

  if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    throw new Error("Invalid workflow payload.");
  }

  const nodes = parsed.nodes.map((node, index) => {
    const candidate = node as Partial<WorkflowNode>;
    if (!candidate || typeof candidate !== "object") {
      throw new Error(`Invalid node at index ${index}.`);
    }

    if (typeof candidate.id !== "string") {
      throw new Error(`Node at index ${index} is missing a valid id.`);
    }

    if (
      !candidate.position ||
      typeof candidate.position.x !== "number" ||
      typeof candidate.position.y !== "number"
    ) {
      throw new Error(`Node ${candidate.id} has an invalid position.`);
    }

    if (!candidate.type || !isWorkflowNodeType(candidate.type)) {
      throw new Error(`Node ${candidate.id} has an invalid type.`);
    }

    if (!candidate.data || typeof candidate.data !== "object") {
      throw new Error(`Node ${candidate.id} is missing data.`);
    }

    const data = candidate.data as WorkflowNodeData;
    if (data.kind !== candidate.type) {
      throw new Error(
        `Node ${candidate.id} has mismatched type and data kind.`,
      );
    }

    return candidate as WorkflowNode;
  });

  const nodeIds = new Set<string>();
  nodes.forEach((node) => {
    if (nodeIds.has(node.id)) {
      throw new Error(`Duplicate node id found: ${node.id}.`);
    }
    nodeIds.add(node.id);
  });

  const edges = parsed.edges.map((edge, index) => {
    const candidate = edge as Partial<WorkflowEdge>;

    if (!candidate || typeof candidate !== "object") {
      throw new Error(`Invalid edge at index ${index}.`);
    }

    if (
      typeof candidate.id !== "string" ||
      typeof candidate.source !== "string" ||
      typeof candidate.target !== "string"
    ) {
      throw new Error(`Edge at index ${index} is malformed.`);
    }

    return candidate as WorkflowEdge;
  });

  const edgeIds = new Set<string>();
  edges.forEach((edge) => {
    if (edgeIds.has(edge.id)) {
      throw new Error(`Duplicate edge id found: ${edge.id}.`);
    }
    edgeIds.add(edge.id);
  });

  edges.forEach((edge) => {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      throw new Error(
        `Edge ${edge.id} references missing nodes (${edge.source} -> ${edge.target}).`,
      );
    }
  });

  return {
    name: typeof parsed.name === "string" ? parsed.name : "Imported workflow",
    nodes,
    edges,
  };
};
