import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import type { AutomationAction, AutomatedNodeData } from "../types/workflow";

interface AutomatedNodeFormProps {
  value: AutomatedNodeData;
  actions: AutomationAction[];
  onSave: (value: AutomatedNodeData) => void;
}

export function AutomatedNodeForm({
  value,
  actions,
  onSave,
}: AutomatedNodeFormProps) {
  const { register, handleSubmit, watch, reset, setValue } =
    useForm<AutomatedNodeData>({ defaultValues: value });
  const actionId = watch("actionId");

  const actionParams = useMemo(
    () => actions.find((action) => action.id === actionId)?.params ?? [],
    [actions, actionId],
  );

  useEffect(() => {
    reset(value);
  }, [reset, value]);

  useEffect(() => {
    if (actionParams.length === 0) {
      return;
    }

    const nextParameters = actionParams.reduce<Record<string, string>>(
      (accumulator, param) => {
        accumulator[param] = value.parameters[param] ?? "";
        return accumulator;
      },
      {},
    );

    setValue("parameters", nextParameters, { shouldDirty: true });
  }, [actionParams, setValue, value.parameters]);

  return (
    <form className="workflow-form" onSubmit={handleSubmit(onSave)}>
      <div>
        <label className="workflow-label" htmlFor="automated-title">
          Title
        </label>
        <input
          id="automated-title"
          className="workflow-input"
          {...register("title", { required: true })}
        />
      </div>
      <div>
        <label className="workflow-label" htmlFor="automated-action">
          Action
        </label>
        <select
          id="automated-action"
          className="workflow-input"
          {...register("actionId")}
        >
          <option value="">Select an action</option>
          {actions.map((action) => (
            <option key={action.id} value={action.id}>
              {action.label}
            </option>
          ))}
        </select>
      </div>
      <div className="workflow-section">
        <div className="workflow-section__heading">Dynamic parameters</div>
        <div className="workflow-stack">
          {actionParams.length === 0 ? (
            <p className="workflow-muted">
              Choose an action to load its parameters.
            </p>
          ) : (
            actionParams.map((param) => (
              <div key={param}>
                <label
                  className="workflow-label"
                  htmlFor={`automated-param-${param}`}
                >
                  {param}
                </label>
                <input
                  id={`automated-param-${param}`}
                  className="workflow-input"
                  {...register(`parameters.${param}` as const)}
                />
              </div>
            ))
          )}
        </div>
      </div>
      <button type="submit" className="workflow-primary-button">
        Save automation node
      </button>
    </form>
  );
}
