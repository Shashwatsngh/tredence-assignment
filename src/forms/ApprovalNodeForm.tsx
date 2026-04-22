import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { ApprovalNodeData } from "../types/workflow";

interface ApprovalNodeFormProps {
  value: ApprovalNodeData;
  onSave: (value: ApprovalNodeData) => void;
}

export function ApprovalNodeForm({ value, onSave }: ApprovalNodeFormProps) {
  const { register, handleSubmit, reset } = useForm<ApprovalNodeData>({
    defaultValues: value,
  });

  useEffect(() => {
    reset(value);
  }, [reset, value]);

  return (
    <form className="workflow-form" onSubmit={handleSubmit(onSave)}>
      <div>
        <label className="workflow-label" htmlFor="approval-title">
          Title
        </label>
        <input
          id="approval-title"
          className="workflow-input"
          {...register("title", { required: true })}
        />
      </div>
      <div>
        <label className="workflow-label" htmlFor="approval-role">
          Approver role
        </label>
        <input
          id="approval-role"
          className="workflow-input"
          {...register("approverRole")}
        />
      </div>
      <div>
        <label className="workflow-label" htmlFor="approval-threshold">
          Auto-approve threshold
        </label>
        <input
          id="approval-threshold"
          type="number"
          min="0"
          max="100"
          className="workflow-input"
          {...register("autoApproveThreshold", { valueAsNumber: true })}
        />
      </div>
      <button type="submit" className="workflow-primary-button">
        Save approval node
      </button>
    </form>
  );
}
