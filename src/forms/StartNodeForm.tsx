import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type { StartNodeData } from "../types/workflow";

interface StartNodeFormProps {
  value: StartNodeData;
  onSave: (value: StartNodeData) => void;
}

export function StartNodeForm({ value, onSave }: StartNodeFormProps) {
  const { register, handleSubmit, control, reset } = useForm<StartNodeData>({
    defaultValues: value,
  });
  const fields = useFieldArray({ control, name: "metadata" });

  useEffect(() => {
    reset(value);
  }, [reset, value]);

  return (
    <form className="workflow-form" onSubmit={handleSubmit(onSave)}>
      <div>
        <label className="workflow-label" htmlFor="start-title">
          Title
        </label>
        <input
          id="start-title"
          className="workflow-input"
          {...register("title", { required: true })}
        />
      </div>
      <div className="workflow-section">
        <div className="workflow-section__heading">Metadata</div>
        <div className="workflow-stack">
          {fields.fields.map((field, index) => (
            <div
              key={field.id}
              className="workflow-grid-2 workflow-grid-2--compact"
            >
              <input
                className="workflow-input"
                placeholder="Key"
                {...register(`metadata.${index}.key` as const)}
              />
              <div className="workflow-row">
                <input
                  className="workflow-input"
                  placeholder="Value"
                  {...register(`metadata.${index}.value` as const)}
                />
                <button
                  type="button"
                  className="workflow-icon-button"
                  onClick={() => fields.remove(index)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="workflow-secondary-button"
            onClick={() => fields.append({ key: "", value: "" })}
          >
            Add metadata
          </button>
        </div>
      </div>
      <button type="submit" className="workflow-primary-button">
        Save start node
      </button>
    </form>
  );
}
