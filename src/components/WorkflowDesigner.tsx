import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type OnConnect,
  type OnEdgesDelete,
  type OnNodesDelete,
  type NodeTypes,
} from "reactflow";
import { simulateWorkflow } from "../api/mockApi";
import { useWorkflow } from "../hooks/useWorkflow";
import { useValidation } from "../hooks/useValidation";
import { AutomatedNode } from "../nodes/AutomatedNode";
import { ApprovalNode } from "../nodes/ApprovalNode";
import { EndNode } from "../nodes/EndNode";
import { StartNode } from "../nodes/StartNode";
import { TaskNode } from "../nodes/TaskNode";
import { isWorkflowNodeType, type SimulationLogEntry } from "../types/workflow";
import {
  downloadWorkflow,
  parseWorkflow,
} from "../utils/workflowSerialization";
import { sortIssues } from "../utils/workflowValidation";
import { NodeConfigPanel } from "./NodeConfigPanel";
import { SimulationPanel } from "./SimulationPanel";
import { Sidebar } from "./Sidebar";
import { InstructionsModal } from "./InstructionsModal";

const nodeTypes: NodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
};

const buildExportName = (name: string) =>
  `${name.toLowerCase().replace(/\s+/g, "-")}-workflow.json`;

type ThemeMode = "dark" | "light";
const THEME_STORAGE_KEY = "workflow-theme";
const INSTRUCTIONS_SEEN_KEY = "workflow-instructions-seen";
type AppSection = "dashboard" | "compliance" | "scheduler" | "analytics";

export function WorkflowDesigner() {
  const flowWrapperId = useId();
  const {
    name,
    nodes,
    edges,
    selectedNodeId,
    setName,
    setSelectedNodeId,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    removeNodes,
    removeEdges,
    loadWorkflow,
    exportWorkflow,
    undo,
    redo,
  } = useWorkflow();
  const validation = useValidation();
  const [logs, setLogs] = useState<SimulationLogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activePlaybackNodeId, setActivePlaybackNodeId] = useState<
    string | null
  >(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") {
      return stored;
    }

    return "light";
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeSection, setActiveSection] = useState<AppSection>("dashboard");
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    const seen = window.localStorage.getItem(INSTRUCTIONS_SEEN_KEY);
    return !seen;
  });
  const playbackTimersRef = useRef<Array<ReturnType<typeof window.setTimeout>>>(
    [],
  );

  const clearPlaybackTimers = useCallback(() => {
    playbackTimersRef.current.forEach((timerId) =>
      window.clearTimeout(timerId),
    );
    playbackTimersRef.current = [];
  }, []);

  const playSimulation = useCallback(
    (entries: SimulationLogEntry[]) => {
      clearPlaybackTimers();
      setActivePlaybackNodeId(null);

      if (entries.length === 0) {
        return;
      }

      entries.forEach((entry, index) => {
        const timerId = window.setTimeout(() => {
          setActivePlaybackNodeId(entry.nodeId);
        }, index * 650);

        playbackTimersRef.current.push(timerId);
      });

      const resetTimerId = window.setTimeout(
        () => setActivePlaybackNodeId(null),
        entries.length * 650 + 400,
      );

      playbackTimersRef.current.push(resetTimerId);
    },
    [clearPlaybackTimers],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (!showInstructions) {
      window.localStorage.setItem(INSTRUCTIONS_SEEN_KEY, "true");
    }
  }, [showInstructions]);

  useEffect(() => () => clearPlaybackTimers(), [clearPlaybackTimers]);

  const renderedNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        className:
          node.id === activePlaybackNodeId ? "workflow-node--active" : "",
      })),
    [activePlaybackNodeId, nodes],
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const bounds = event.currentTarget.getBoundingClientRect();
      const rawType = event.dataTransfer.getData("application/reactflow");

      if (!rawType || !isWorkflowNodeType(rawType)) {
        return;
      }

      addNode(rawType, {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
    },
    [addNode],
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onNodesDelete: OnNodesDelete = useCallback(
    (deletedNodes) => {
      removeNodes(deletedNodes.map((node) => node.id));
      setSelectedEdgeId(null);
    },
    [removeNodes],
  );

  const onEdgesDelete: OnEdgesDelete = useCallback(
    (deletedEdges) => {
      removeEdges(deletedEdges.map((edge) => edge.id));
      setSelectedEdgeId((previous) => {
        if (!previous) {
          return previous;
        }

        return deletedEdges.some((edge) => edge.id === previous)
          ? null
          : previous;
      });
    },
    [removeEdges],
  );

  const clearSelections = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [setSelectedNodeId]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedEdgeId) {
      removeEdges([selectedEdgeId]);
      setSelectedEdgeId(null);
      return;
    }

    if (selectedNodeId) {
      removeNodes([selectedNodeId]);
    }
  }, [removeEdges, removeNodes, selectedEdgeId, selectedNodeId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        const hasSelection = Boolean(selectedNodeId || selectedEdgeId);
        if (!hasSelection) {
          return;
        }

        event.preventDefault();
        handleDeleteSelected();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleDeleteSelected, selectedEdgeId, selectedNodeId]);

  const dashboardSummary = useMemo(() => {
    const connected = new Set(edges.map((edge) => edge.source));
    return {
      nodes: nodes.length,
      edges: edges.length,
      connected: connected.size,
    };
  }, [edges, nodes.length]);

  const complianceSummary = useMemo(() => {
    const approvalNodes = nodes.filter(
      (node) => node.type === "approval",
    ).length;
    const automatedNodes = nodes.filter(
      (node) => node.type === "automated",
    ).length;
    const startNodes = nodes.filter((node) => node.type === "start").length;

    return {
      approvalNodes,
      automatedNodes,
      startNodes,
      issues: validation.issues.length,
      ready: validation.valid,
    };
  }, [nodes, validation.issues.length, validation.valid]);

  const schedulerSummary = useMemo(() => {
    const now = new Date();
    const nextRun = new Date(now.getTime() + 15 * 60 * 1000);
    const simulatedDurationSeconds = Math.max(4, logs.length * 2);

    return {
      nextRunLabel: nextRun.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      cadence: "Every 15 min",
      simulatedDurationSeconds,
      lastRun: logs.length > 0 ? "Successful" : "Not run yet",
    };
  }, [logs.length]);

  const analyticsSummary = useMemo(() => {
    const total = logs.length;
    const complete = logs.filter((entry) => entry.status === "complete").length;
    const failed = logs.filter((entry) => entry.status === "error").length;
    const running = logs.filter((entry) => entry.status === "running").length;

    return {
      total,
      complete,
      failed,
      running,
      successRate: total > 0 ? Math.round((complete / total) * 100) : 0,
    };
  }, [logs]);

  const handleSimulate = useCallback(async () => {
    setIsRunning(true);
    setErrorMessage(null);

    try {
      const result = await simulateWorkflow(exportWorkflow());
      setLogs(result.logs);
      playSimulation(result.logs);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Simulation failed.";
      clearPlaybackTimers();
      setActivePlaybackNodeId(null);
      setLogs([]);
      setErrorMessage(message);
    } finally {
      setIsRunning(false);
    }
  }, [clearPlaybackTimers, exportWorkflow, playSimulation]);

  const handleExport = useCallback(() => {
    downloadWorkflow(exportWorkflow(), buildExportName(name));
  }, [exportWorkflow, name]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImport = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      try {
        setErrorMessage(null);
        const raw = await file.text();
        const parsed = parseWorkflow(raw);
        loadWorkflow(parsed);
        setSelectedNodeId(parsed.nodes[0]?.id ?? null);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Import failed due to invalid JSON.";
        setErrorMessage(message);
      }

      event.target.value = "";
    },
    [loadWorkflow, setSelectedNodeId],
  );

  return (
    <ReactFlowProvider>
      <div className="designer-shell">
        <header className="designer-header">
          <div className="designer-header__identity">
            <div className="designer-brand">CodeAuto</div>
            <div className="designer-header__meta">
              <div className="eyebrow">Workflow Studio</div>
              <div className="designer-header__title">User Automation</div>
            </div>
          </div>
          <div className="designer-actions">
            <button
              type="button"
              className="workflow-secondary-button"
              onClick={() =>
                setThemeMode((mode) => (mode === "dark" ? "light" : "dark"))
              }
            >
              {themeMode === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <button
              type="button"
              className="workflow-secondary-button"
              onClick={() => setShowInstructions(true)}
            >
              Help
            </button>
            <button
              type="button"
              className="workflow-secondary-button"
              onClick={undo}
            >
              Undo
            </button>
            <button
              type="button"
              className="workflow-secondary-button"
              onClick={redo}
            >
              Redo
            </button>
            <button
              type="button"
              className="workflow-secondary-button"
              onClick={handleDeleteSelected}
              disabled={!selectedNodeId && !selectedEdgeId}
            >
              Delete selected
            </button>
            <button
              type="button"
              className="workflow-secondary-button"
              onClick={handleImportClick}
            >
              Import JSON
            </button>
            <button
              type="button"
              className="workflow-secondary-button"
              onClick={handleExport}
            >
              Export JSON
            </button>
            <button
              type="button"
              className="workflow-primary-button"
              onClick={handleSimulate}
            >
              Simulate workflow
            </button>
          </div>
        </header>

        <main className="designer-grid designer-grid--reference">
          <Sidebar
            workflowName={name}
            onWorkflowNameChange={setName}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />

          <section className="panel panel--canvas panel--canvas-reference">
            <div className="panel__section panel__section--header">
              <div>
                <div className="panel__heading">Canvas</div>
                <div className="workflow-muted">
                  Model workflow logic visually and inspect progression in real
                  time.
                </div>
              </div>
              <div className="workflow-pill">
                {selectedEdgeId
                  ? "1 edge selected"
                  : selectedNodeId
                    ? "1 node selected"
                    : `${nodes.length} nodes`}
              </div>
            </div>

            <div
              id={flowWrapperId}
              className="canvas-shell"
              onDrop={onDrop}
              onDragOver={onDragOver}
            >
              <ReactFlow
                nodes={renderedNodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect as OnConnect}
                onNodeClick={(_, node) => {
                  setSelectedNodeId(node.id);
                  setSelectedEdgeId(null);
                }}
                onEdgeClick={(_, edge) => {
                  setSelectedEdgeId(edge.id);
                  setSelectedNodeId(null);
                }}
                onPaneClick={clearSelections}
                onNodesDelete={onNodesDelete}
                onEdgesDelete={onEdgesDelete}
                fitView
                deleteKeyCode={["Backspace", "Delete"]}
                multiSelectionKeyCode="Shift"
                defaultEdgeOptions={{ type: "smoothstep", animated: true }}
              >
                <MiniMap
                  nodeStrokeColor={(node) => {
                    switch (node.type) {
                      case "start":
                        return "#0f766e";
                      case "task":
                        return "#2563eb";
                      case "approval":
                        return "#d97706";
                      case "automated":
                        return "#7c3aed";
                      case "end":
                        return "#be123c";
                      default:
                        return "#64748b";
                    }
                  }}
                  nodeColor={(node) => {
                    switch (node.type) {
                      case "start":
                        return "#ccfbf1";
                      case "task":
                        return "#dbeafe";
                      case "approval":
                        return "#fef3c7";
                      case "automated":
                        return "#ede9fe";
                      case "end":
                        return "#ffe4e6";
                      default:
                        return "#e2e8f0";
                    }
                  }}
                />
                <Controls />
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={20}
                  size={1}
                />
              </ReactFlow>
            </div>

            <div className="panel__section panel__section--footer">
              <div className="workflow-muted">
                {validation.valid
                  ? "Workflow is ready for simulation."
                  : "Resolve validation errors before shipping the flow."}
              </div>
              <div className="workflow-pill">
                Zoom and pan enabled | Select node/edge then press Delete
              </div>
            </div>
          </section>

          <aside className="designer-right-rail">
            {activeSection === "dashboard" ? (
              <section className="panel">
                <div className="panel__section">
                  <div className="panel__heading">Dashboard</div>
                  <div className="workflow-grid-2 workflow-grid-2--compact">
                    <div className="workflow-pill">
                      Nodes: {dashboardSummary.nodes}
                    </div>
                    <div className="workflow-pill">
                      Edges: {dashboardSummary.edges}
                    </div>
                    <div className="workflow-pill">
                      Connected nodes: {dashboardSummary.connected}
                    </div>
                    <div className="workflow-pill">
                      Active selection:{" "}
                      {selectedNodeId || selectedEdgeId || "None"}
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {activeSection === "compliance" ? (
              <section className="panel">
                <div className="panel__section">
                  <div className="panel__heading">Compliance</div>
                  <div className="workflow-stack">
                    <div className="workflow-pill">
                      Validation:{" "}
                      {complianceSummary.ready ? "Pass" : "Attention needed"}
                    </div>
                    <div className="workflow-pill">
                      Approval nodes: {complianceSummary.approvalNodes}
                    </div>
                    <div className="workflow-pill">
                      Automated nodes: {complianceSummary.automatedNodes}
                    </div>
                    <div className="workflow-pill">
                      Start nodes: {complianceSummary.startNodes}
                    </div>
                    <div className="workflow-pill">
                      Open issues: {complianceSummary.issues}
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {activeSection === "scheduler" ? (
              <section className="panel">
                <div className="panel__section">
                  <div className="panel__heading">Scheduler</div>
                  <div className="workflow-stack">
                    <div className="workflow-pill">
                      Next run: {schedulerSummary.nextRunLabel}
                    </div>
                    <div className="workflow-pill">
                      Cadence: {schedulerSummary.cadence}
                    </div>
                    <div className="workflow-pill">
                      Estimated run time:{" "}
                      {schedulerSummary.simulatedDurationSeconds}s
                    </div>
                    <div className="workflow-pill">
                      Last run: {schedulerSummary.lastRun}
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {activeSection === "analytics" ? (
              <section className="panel">
                <div className="panel__section">
                  <div className="panel__heading">Analytics</div>
                  <div className="workflow-stack">
                    <div className="workflow-pill">
                      Total events: {analyticsSummary.total}
                    </div>
                    <div className="workflow-pill">
                      Completed: {analyticsSummary.complete}
                    </div>
                    <div className="workflow-pill">
                      Running: {analyticsSummary.running}
                    </div>
                    <div className="workflow-pill">
                      Failed: {analyticsSummary.failed}
                    </div>
                    <div className="workflow-pill">
                      Success rate: {analyticsSummary.successRate}%
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            <NodeConfigPanel onClearSelection={() => setSelectedNodeId(null)} />
            <SimulationPanel
              logs={logs}
              issues={sortIssues(validation.issues)}
              isRunning={isRunning}
              errorMessage={errorMessage}
            />
          </aside>
        </main>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleImport}
        />
        <InstructionsModal
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
        />
      </div>
    </ReactFlowProvider>
  );
}
