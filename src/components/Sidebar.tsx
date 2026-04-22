import type { DragEvent } from "react";
import type { WorkflowNodeType } from "../types/workflow";

const items: Array<{
  type: WorkflowNodeType;
  title: string;
  description: string;
}> = [
  {
    type: "start",
    title: "Start Node",
    description: "Defines the workflow entry point",
  },
  { type: "task", title: "Task Node", description: "A manual HR task" },
  {
    type: "approval",
    title: "Approval Node",
    description: "Approval or sign-off step",
  },
  {
    type: "automated",
    title: "Automated Node",
    description: "API-driven automation step",
  },
  { type: "end", title: "End Node", description: "Closes the workflow run" },
];

interface SidebarProps {
  workflowName: string;
  onWorkflowNameChange: (value: string) => void;
  activeSection: "dashboard" | "compliance" | "scheduler" | "analytics";
  onSectionChange: (
    section: "dashboard" | "compliance" | "scheduler" | "analytics",
  ) => void;
}

export function Sidebar({
  workflowName,
  onWorkflowNameChange,
  activeSection,
  onSectionChange,
}: SidebarProps) {
  const onDragStart = (
    event: DragEvent<HTMLButtonElement>,
    nodeType: WorkflowNodeType,
  ) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="panel panel--sidebar">
      <div className="panel__section">
        <div className="sidebar-product">CodeAuto</div>
        <div className="sidebar-nav-group">
          <div className="eyebrow">General</div>
          <button
            type="button"
            className={`sidebar-nav-item ${
              activeSection === "dashboard" ? "sidebar-nav-item--active" : ""
            }`}
            onClick={() => onSectionChange("dashboard")}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`sidebar-nav-item ${
              activeSection === "compliance" ? "sidebar-nav-item--active" : ""
            }`}
            onClick={() => onSectionChange("compliance")}
          >
            Compliance
          </button>
          <button
            type="button"
            className={`sidebar-nav-item ${
              activeSection === "scheduler" ? "sidebar-nav-item--active" : ""
            }`}
            onClick={() => onSectionChange("scheduler")}
          >
            Scheduler
          </button>
          <button
            type="button"
            className={`sidebar-nav-item ${
              activeSection === "analytics" ? "sidebar-nav-item--active" : ""
            }`}
            onClick={() => onSectionChange("analytics")}
          >
            Analytics
          </button>
        </div>
      </div>

      <div className="panel__section">
        <label className="workflow-label" htmlFor="workflow-name">
          Workflow name
        </label>
        <input
          id="workflow-name"
          className="workflow-input"
          value={workflowName}
          onChange={(event) => onWorkflowNameChange(event.target.value)}
        />
      </div>

      <div className="panel__section">
        <div className="panel__heading">Node Library</div>
        <div className="workflow-stack">
          {items.map((item) => (
            <button
              key={item.type}
              type="button"
              draggable
              onDragStart={(event) => onDragStart(event, item.type)}
              className="workflow-drag-item"
            >
              <div className="workflow-drag-item__title">{item.title}</div>
              <div className="workflow-drag-item__description">
                {item.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="panel__section panel__section--muted">
        <div className="panel__heading">Canvas rules</div>
        <ul className="workflow-list">
          <li>Only one Start node.</li>
          <li>No cycles when simulating.</li>
          <li>Config changes are typed per node.</li>
        </ul>
      </div>
    </aside>
  );
}
