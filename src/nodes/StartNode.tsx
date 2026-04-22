import { Handle, Position } from "reactflow";
import type { StartNodeData } from "../types/workflow";

interface StartNodeProps {
  data: StartNodeData;
  selected: boolean;
}

export function StartNode({ data, selected }: StartNodeProps) {
  return (
    <div
      className={`workflow-node workflow-node--start ${selected ? "workflow-node--selected" : ""}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="workflow-handle"
      />
      <div className="workflow-node__eyebrow">Start</div>
      <div className="workflow-node__title">{data.title}</div>
      <div className="workflow-node__summary">{data.summary}</div>
      <div className="workflow-node__tooltip">
        <div className="workflow-node__tooltip-title">Start details</div>
        <div className="workflow-node__tooltip-line">Title: {data.title}</div>
        <div className="workflow-node__tooltip-line">
          Metadata: {data.metadata.length}
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
