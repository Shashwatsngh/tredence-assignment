import type { Edge, Node, XYPosition } from "reactflow";

export type WorkflowNodeType =
  | "start"
  | "task"
  | "approval"
  | "automated"
  | "end";

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export interface BaseNodeData {
  kind: WorkflowNodeType;
  title: string;
  summary: string;
}

export interface StartNodeData extends BaseNodeData {
  kind: "start";
  metadata: KeyValuePair[];
}

export interface TaskNodeData extends BaseNodeData {
  kind: "task";
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValuePair[];
}

export interface ApprovalNodeData extends BaseNodeData {
  kind: "approval";
  approverRole: string;
  autoApproveThreshold: number;
}

export interface AutomatedNodeData extends BaseNodeData {
  kind: "automated";
  actionId: string;
  parameters: Record<string, string>;
}

export interface EndNodeData extends BaseNodeData {
  kind: "end";
  endMessage: string;
  summaryFlag: boolean;
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData;

export type WorkflowNode = Node<WorkflowNodeData, WorkflowNodeType>;
export type WorkflowEdge = Edge;

export interface WorkflowSnapshot {
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowDocument extends WorkflowSnapshot {
  id: string;
  updatedAt: string;
}

export interface SimulationLogEntry {
  id: string;
  nodeId: string;
  nodeType: WorkflowNodeType;
  step: number;
  title: string;
  detail: string;
  status: "queued" | "running" | "complete" | "error";
}

export interface ValidationIssue {
  id: string;
  nodeId?: string;
  edgeId?: string;
  severity: "error" | "warning";
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export interface NodeDraftBase {
  id: string;
  type: WorkflowNodeType;
  position: XYPosition;
}

export const workflowNodeTypes: WorkflowNodeType[] = [
  "start",
  "task",
  "approval",
  "automated",
  "end",
];

export const isWorkflowNodeType = (value: string): value is WorkflowNodeType =>
  workflowNodeTypes.includes(value as WorkflowNodeType);

export const isStartNodeData = (
  data: WorkflowNodeData,
): data is StartNodeData => data.kind === "start";

export const isTaskNodeData = (data: WorkflowNodeData): data is TaskNodeData =>
  data.kind === "task";

export const isApprovalNodeData = (
  data: WorkflowNodeData,
): data is ApprovalNodeData => data.kind === "approval";

export const isAutomatedNodeData = (
  data: WorkflowNodeData,
): data is AutomatedNodeData => data.kind === "automated";

export const isEndNodeData = (data: WorkflowNodeData): data is EndNodeData =>
  data.kind === "end";
