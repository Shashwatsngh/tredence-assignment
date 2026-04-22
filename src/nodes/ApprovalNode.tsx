import { Handle, Position } from "reactflow";
import type { ApprovalNodeData } from "../types/workflow";

interface ApprovalNodeProps {
  data: ApprovalNodeData;
  selected: boolean;
}

export function ApprovalNode({ data, selected }: ApprovalNodeProps) {
  const approvalData = data;

  return (
    <div
      className={`workflow-node workflow-node--approval ${selected ? "workflow-node--selected" : ""}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="workflow-handle"
      />
      <div className="workflow-node__eyebrow">Approval</div>
      <div className="workflow-node__title">{approvalData.title}</div>
      <div className="workflow-node__summary">
        {approvalData.approverRole || "Role not set"}
      </div>
      <div className="workflow-node__summary workflow-node__summary--muted">
        Auto-approve at {approvalData.autoApproveThreshold}%
      </div>
      <div className="workflow-node__tooltip">
        <div className="workflow-node__tooltip-title">Approval details</div>
        <div className="workflow-node__tooltip-line">
          Role: {approvalData.approverRole || "Not set"}
        </div>
        <div className="workflow-node__tooltip-line">
          Threshold: {approvalData.autoApproveThreshold}%
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
