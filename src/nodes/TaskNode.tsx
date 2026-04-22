import { Handle, Position } from "reactflow";
import type { TaskNodeData } from "../types/workflow";

interface TaskNodeProps {
  data: TaskNodeData;
  selected: boolean;
}

export function TaskNode({ data, selected }: TaskNodeProps) {
  const taskData = data;

  return (
    <div
      className={`workflow-node workflow-node--task ${selected ? "workflow-node--selected" : ""}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="workflow-handle"
      />
      <div className="workflow-node__eyebrow">Task</div>
      <div className="workflow-node__title">{taskData.title}</div>
      <div className="workflow-node__summary">
        {taskData.assignee || "Unassigned"} ·{" "}
        {taskData.dueDate || "No due date"}
      </div>
      <div className="workflow-node__summary workflow-node__summary--muted">
        {taskData.description}
      </div>
      <div className="workflow-node__tooltip">
        <div className="workflow-node__tooltip-title">Task details</div>
        <div className="workflow-node__tooltip-line">
          Assignee: {taskData.assignee || "Unassigned"}
        </div>
        <div className="workflow-node__tooltip-line">
          Due: {taskData.dueDate || "No due date"}
        </div>
        <div className="workflow-node__tooltip-line">
          Fields: {taskData.customFields.length}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="workflow-handle"
      />
    </div>
  );
}
