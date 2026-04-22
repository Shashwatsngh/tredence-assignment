import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { EndNodeData } from "../types/workflow";

interface EndNodeFormProps {
  value: EndNodeData;
  onSave: (value: EndNodeData) => void;
}

export function EndNodeForm({ value, onSave }: EndNodeFormProps) {
  const { register, handleSubmit, reset } = useForm<EndNodeData>({
    defaultValues: value,
  });

  useEffect(() => {
    reset(value);
  }, [reset, value]);

  return (
    <form className="workflow-form" onSubmit={handleSubmit(onSave)}>
      <div>
        <label className="workflow-label" htmlFor="end-title">
          Title
        </label>
        <input
          id="end-title"
          className="workflow-input"
          {...register("title", { required: true })}
        />
      </div>
      <div>
        <label className="workflow-label" htmlFor="end-message">
          End message
        </label>
        <textarea
          id="end-message"
          className="workflow-input workflow-textarea"
          {...register("endMessage")}
        />
      </div>
      <label className="workflow-toggle">
        <input type="checkbox" {...register("summaryFlag")} />
        <span>Generate summary</span>
      </label>
      <button type="submit" className="workflow-primary-button">
        Save end node
      </button>
    </form>
  );
}
