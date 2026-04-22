import type {
  SimulationLogEntry,
  ValidationResult,
  WorkflowSnapshot,
} from "../types/workflow";
import { validateWorkflow } from "../utils/workflowValidation";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const automations = [
  { id: "send_email", label: "Send Email", params: ["to", "subject"] },
  {
    id: "generate_doc",
    label: "Generate Document",
    params: ["template", "recipient"],
  },
];

export const getAutomations = async () => {
  await delay(250);
  return automations;
};

const topologicalOrder = (workflow: WorkflowSnapshot) => {
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, string[]>();

  workflow.nodes.forEach((node) => {
    incoming.set(node.id, 0);
    outgoing.set(node.id, []);
  });

  workflow.edges.forEach((edge) => {
    incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1);
    outgoing.get(edge.source)?.push(edge.target);
  });

  const queue = workflow.nodes
    .filter((node) => (incoming.get(node.id) ?? 0) === 0)
    .map((node) => node.id);

  const ordered: string[] = [];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    ordered.push(nodeId);

    for (const next of outgoing.get(nodeId) ?? []) {
      const nextIncoming = (incoming.get(next) ?? 0) - 1;
      incoming.set(next, nextIncoming);

      if (nextIncoming === 0) {
        queue.push(next);
      }
    }
  }

  return ordered;
};

export const simulateWorkflow = async (workflow: WorkflowSnapshot) => {
  await delay(350);

  const validation: ValidationResult = validateWorkflow(
    workflow.nodes,
    workflow.edges,
  );
  if (!validation.valid) {
    const error = new Error("Workflow validation failed.");
    (error as Error & { issues?: ValidationResult["issues"] }).issues =
      validation.issues;
    throw error;
  }

  const orderedIds = topologicalOrder(workflow);
  const lookup = new Map(workflow.nodes.map((node) => [node.id, node]));

  const logs: SimulationLogEntry[] = orderedIds.map((nodeId, index) => {
    const node = lookup.get(nodeId);

    if (!node) {
      return {
        id: `${nodeId}-${index}`,
        nodeId,
        nodeType: "task",
        step: index + 1,
        title: "Missing node",
        detail: "Node could not be resolved during simulation.",
        status: "error",
      };
    }

    let detail = "Execution recorded by the mock API.";
    const nodeKind = node.data.kind;

    switch (nodeKind) {
      case "start":
        detail = "Workflow started.";
        break;
      case "task":
        detail = `Task assigned to ${node.data.assignee || "unassigned"}${node.data.dueDate ? `, due ${node.data.dueDate}` : ""}.`;
        break;
      case "approval":
        detail = `Awaiting ${node.data.approverRole || "approval role"} approval at ${node.data.autoApproveThreshold}% threshold.`;
        break;
      case "automated":
        detail = `Executing ${node.data.actionId || "automation"} with ${Object.keys(node.data.parameters).length} parameter(s).`;
        break;
      case "end":
        detail = `${node.data.endMessage || "Workflow finished."}${node.data.summaryFlag ? " Summary will be generated." : ""}`;
        break;
      default:
        break;
    }

    return {
      id: `${node.id}-${index}`,
      nodeId: node.id,
      nodeType: nodeKind,
      step: index + 1,
      title: node.data.title || "Workflow step",
      detail,
      status: "complete",
    };
  });

  return {
    logs,
    startedAt: new Date().toISOString(),
    totalSteps: logs.length,
  };
};
