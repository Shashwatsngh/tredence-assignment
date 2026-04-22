import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type { TaskNodeData } from "../types/workflow";

interface TaskNodeFormProps {
  value: TaskNodeData;
  onSave: (value: TaskNodeData) => void;
}

export function TaskNodeForm({ value, onSave }: TaskNodeFormProps) {
  const { register, handleSubmit, control, reset } = useForm<TaskNodeData>({
    defaultValues: value,
  });

  const fields = useFieldArray({
    control,
    name: "customFields",
  });

  useEffect(() => {
    reset(value);
  }, [reset, value]);

  return (
    <form className="workflow-form" onSubmit={handleSubmit(onSave)}>
      <div>
        <label className="workflow-label" htmlFor="task-title">
          Title
        </label>
        <input
          id="task-title"
          className="workflow-input"
          {...register("title", { required: true })}
        />
      </div>
      <div>
        <label className="workflow-label" htmlFor="task-description">
          Description
        </label>
        <textarea
          id="task-description"
          className="workflow-input workflow-textarea"
          {...register("description")}
        />
      </div>
      <div className="workflow-grid-2">
        <div>
          <label className="workflow-label" htmlFor="task-assignee">
            Assignee
          </label>
          <input
            id="task-assignee"
            className="workflow-input"
            {...register("assignee")}
          />
        </div>
        <div>
          <label className="workflow-label" htmlFor="task-dueDate">
            Due date
          </label>
          <input
            id="task-dueDate"
            type="date"
            className="workflow-input"
            {...register("dueDate")}
          />
        </div>
      </div>
      <div className="workflow-section">
        <div className="workflow-section__heading">Custom fields</div>
        <div className="workflow-stack">
          {fields.fields.map((field, index) => (
            <div
              key={field.id}
              className="workflow-grid-2 workflow-grid-2--compact"
            >
              <input
                className="workflow-input"
                placeholder="Label"
                {...register(`customFields.${index}.key` as const)}
              />
              <div className="workflow-row">
                <input
                  className="workflow-input"
                  placeholder="Value"
                  {...register(`customFields.${index}.value` as const)}
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
            Add field
          </button>
        </div>
      </div>
      <button type="submit" className="workflow-primary-button">
        Save task
      </button>
    </form>
  );
}
