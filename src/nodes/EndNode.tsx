import { Handle, Position } from "reactflow";
import type { EndNodeData } from "../types/workflow";

interface EndNodeProps {
  data: EndNodeData;
  selected: boolean;
}

export function EndNode({ data, selected }: EndNodeProps) {
  const endData = data;

  return (
    <div
      className={`workflow-node workflow-node--end ${selected ? "workflow-node--selected" : ""}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="workflow-handle"
      />
      <div className="workflow-node__eyebrow">End</div>
      <div className="workflow-node__title">{endData.title}</div>
      <div className="workflow-node__summary">{endData.endMessage}</div>
      <div className="workflow-node__summary workflow-node__summary--muted">
        {endData.summaryFlag ? "Summary enabled" : "Summary disabled"}
      </div>
      <div className="workflow-node__tooltip">
        <div className="workflow-node__tooltip-title">End details</div>
        <div className="workflow-node__tooltip-line">
          Message: {endData.endMessage}
        </div>
        <div className="workflow-node__tooltip-line">
          Summary: {endData.summaryFlag ? "Enabled" : "Disabled"}
        </div>
      </div>
    </div>
  );
}
