import { Handle, Position } from "reactflow";
import type { AutomatedNodeData } from "../types/workflow";

interface AutomatedNodeProps {
  data: AutomatedNodeData;
  selected: boolean;
}

export function AutomatedNode({ data, selected }: AutomatedNodeProps) {
  const automatedData = data;

  return (
    <div
      className={`workflow-node workflow-node--automated ${selected ? "workflow-node--selected" : ""}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="workflow-handle"
      />
      <div className="workflow-node__eyebrow">Automated</div>
      <div className="workflow-node__title">{automatedData.title}</div>
      <div className="workflow-node__summary">
        {automatedData.actionId || "Choose action"}
      </div>
      <div className="workflow-node__summary workflow-node__summary--muted">
        {Object.keys(automatedData.parameters).length} parameter(s)
      </div>
      <div className="workflow-node__tooltip">
        <div className="workflow-node__tooltip-title">Automation details</div>
        <div className="workflow-node__tooltip-line">
          Action: {automatedData.actionId || "Not selected"}
        </div>
        <div className="workflow-node__tooltip-line">
          Params: {Object.keys(automatedData.parameters).join(", ") || "None"}
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
