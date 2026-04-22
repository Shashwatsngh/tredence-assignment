import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Node,
  Position,
  type Connection,
} from "reactflow";
import { create } from "zustand";
import { isWorkflowNodeType } from "../types/workflow";
import type {
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeData,
  WorkflowNodeType,
  WorkflowSnapshot,
} from "../types/workflow";

type WorkflowHistoryEntry = WorkflowSnapshot;

interface WorkflowState {
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  historyPast: WorkflowHistoryEntry[];
  historyFuture: WorkflowHistoryEntry[];
  setName: (name: string) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  onNodesChange: (changes: Parameters<typeof applyNodeChanges>[0]) => void;
  onEdgesChange: (changes: Parameters<typeof applyEdgeChanges>[0]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (
    nodeType: WorkflowNodeType,
    position: { x: number; y: number },
  ) => void;
  updateNodeData: (nodeId: string, data: WorkflowNodeData) => void;
  removeNodes: (nodeIds: string[]) => void;
  removeEdges: (edgeIds: string[]) => void;
  loadWorkflow: (workflow: WorkflowSnapshot) => void;
  exportWorkflow: () => WorkflowSnapshot;
  undo: () => void;
  redo: () => void;
}

const createId = (prefix: string) =>
  `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

const createNodeData = (type: WorkflowNodeType): WorkflowNodeData => {
  switch (type) {
    case "start":
      return {
        kind: "start",
        title: "Start onboarding",
        summary: "Entry point for the workflow",
        metadata: [{ key: "owner", value: "HR Team" }],
      };
    case "approval":
      return {
        kind: "approval",
        title: "Manager approval",
        summary: "Approval gate before continuing",
        approverRole: "Line Manager",
        autoApproveThreshold: 80,
      };
    case "automated":
      return {
        kind: "automated",
        title: "Automated action",
        summary: "System-driven step",
        actionId: "send_email",
        parameters: { to: "", subject: "" },
      };
    case "end":
      return {
        kind: "end",
        title: "Finish",
        summary: "Workflow completed",
        endMessage: "Workflow completed successfully.",
        summaryFlag: true,
      };
    case "task":
    default:
      return {
        kind: "task",
        title: "Prepare hardware",
        summary: "Manual task assigned to an owner",
        description: "Collect laptop, badge, and welcome materials.",
        assignee: "HR Ops",
        dueDate: "",
        customFields: [{ key: "priority", value: "Medium" }],
      };
  }
};

const initialNodes: WorkflowNode[] = [
  {
    id: "start-1",
    type: "start",
    position: { x: 72, y: 180 },
    data: createNodeData("start"),
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: "task-1",
    type: "task",
    position: { x: 360, y: 150 },
    data: createNodeData("task"),
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: "end-1",
    type: "end",
    position: { x: 672, y: 180 },
    data: createNodeData("end"),
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
];

const initialEdges: WorkflowEdge[] = [
  {
    id: "start-task",
    source: "start-1",
    target: "task-1",
    type: "smoothstep",
  },
  {
    id: "task-end",
    source: "task-1",
    target: "end-1",
    type: "smoothstep",
  },
];

const createSnapshot = (
  state: Pick<WorkflowState, "name" | "nodes" | "edges">,
): WorkflowSnapshot => ({
  name: state.name,
  nodes: state.nodes,
  edges: state.edges,
});

const pushHistory = (state: WorkflowState): WorkflowHistoryEntry[] => [
  ...state.historyPast,
  createSnapshot(state),
];

const normalizeWorkflowNodes = (
  nodes: Array<Node<WorkflowNodeData>>,
): WorkflowNode[] =>
  nodes.map((node) => {
    const nextType =
      node.type && isWorkflowNodeType(node.type) ? node.type : node.data.kind;

    return {
      ...node,
      type: nextType,
      data: {
        ...node.data,
        kind: nextType,
      },
    } as WorkflowNode;
  });

const initialWorkflow = createSnapshot({
  name: "Onboarding workflow",
  nodes: initialNodes,
  edges: initialEdges,
});

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  name: initialWorkflow.name,
  nodes: initialWorkflow.nodes,
  edges: initialWorkflow.edges,
  selectedNodeId: "task-1",
  historyPast: [],
  historyFuture: [],
  setName: (name) => set({ name }),
  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),
  onNodesChange: (changes) => {
    set((state) => ({
      nodes: normalizeWorkflowNodes(
        applyNodeChanges<WorkflowNodeData>(changes, state.nodes),
      ),
    }));
  },
  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },
  onConnect: (connection) => {
    const nextState = get();
    set({
      historyPast: pushHistory(nextState),
      historyFuture: [],
      edges: addEdge(
        {
          ...connection,
          type: "smoothstep",
        },
        nextState.edges,
      ),
    });
  },
  addNode: (nodeType, position) => {
    const nextState = get();
    const id = createId(nodeType);
    const data = createNodeData(nodeType);

    const node: WorkflowNode = {
      id,
      type: nodeType,
      position,
      data,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };

    set({
      historyPast: pushHistory(nextState),
      historyFuture: [],
      nodes: [...nextState.nodes, node],
      selectedNodeId: id,
    });
  },
  updateNodeData: (nodeId, data) => {
    const nextState = get();

    set({
      historyPast: pushHistory(nextState),
      historyFuture: [],
      nodes: nextState.nodes.map((node) =>
        node.id === nodeId ? { ...node, data } : node,
      ),
    });
  },
  removeNodes: (nodeIds) => {
    const nextState = get();

    set({
      historyPast: pushHistory(nextState),
      historyFuture: [],
      nodes: nextState.nodes.filter((node) => !nodeIds.includes(node.id)),
      edges: nextState.edges.filter(
        (edge) =>
          !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target),
      ),
      selectedNodeId:
        nextState.selectedNodeId && nodeIds.includes(nextState.selectedNodeId)
          ? null
          : nextState.selectedNodeId,
    });
  },
  removeEdges: (edgeIds) => {
    const nextState = get();

    set({
      historyPast: pushHistory(nextState),
      historyFuture: [],
      edges: nextState.edges.filter((edge) => !edgeIds.includes(edge.id)),
    });
  },
  loadWorkflow: (workflow) => {
    const nextState = get();

    set({
      historyPast: pushHistory(nextState),
      historyFuture: [],
      name: workflow.name,
      nodes: workflow.nodes,
      edges: workflow.edges,
      selectedNodeId: workflow.nodes[0]?.id ?? null,
    });
  },
  exportWorkflow: () => createSnapshot(get()),
  undo: () => {
    const state = get();
    const previous = state.historyPast.at(-1);
    if (!previous) {
      return;
    }

    const historyPast = state.historyPast.slice(0, -1);
    const future = [createSnapshot(state), ...state.historyFuture];

    set({
      name: previous.name,
      nodes: previous.nodes,
      edges: previous.edges,
      historyPast,
      historyFuture: future,
      selectedNodeId: previous.nodes[0]?.id ?? null,
    });
  },
  redo: () => {
    const state = get();
    const [next, ...future] = state.historyFuture;

    if (!next) {
      return;
    }

    set({
      name: next.name,
      nodes: next.nodes,
      edges: next.edges,
      historyPast: [...state.historyPast, createSnapshot(state)],
      historyFuture: future,
      selectedNodeId: next.nodes[0]?.id ?? null,
    });
  },
}));
