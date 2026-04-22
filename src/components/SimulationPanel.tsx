import type { SimulationLogEntry, ValidationIssue } from "../types/workflow";

interface SimulationPanelProps {
  logs: SimulationLogEntry[];
  issues: ValidationIssue[];
  isRunning: boolean;
  errorMessage: string | null;
}

export function SimulationPanel({
  logs,
  issues,
  isRunning,
  errorMessage,
}: SimulationPanelProps) {
  return (
    <section className="panel panel--simulation">
      <div className="panel__section panel__section--header">
        <div>
          <div className="eyebrow">Simulation</div>
          <h2 className="panel__title panel__title--compact">Execution log</h2>
        </div>
        <div className="workflow-pill">{isRunning ? "Running" : "Idle"}</div>
      </div>

      {errorMessage ? (
        <div className="workflow-alert workflow-alert--error">
          {errorMessage}
        </div>
      ) : null}

      {issues.length > 0 ? (
        <div className="workflow-alert">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className={
                issue.severity === "error"
                  ? "workflow-alert__error"
                  : "workflow-alert__warning"
              }
            >
              {issue.message}
            </div>
          ))}
        </div>
      ) : null}

      <div className="workflow-log">
        {logs.length === 0 ? (
          <p className="workflow-muted">
            Run the simulation to view step-by-step execution output.
          </p>
        ) : (
          logs.map((entry) => (
            <article key={entry.id} className="workflow-log__item">
              <div className="workflow-log__step">Step {entry.step}</div>
              <div className="workflow-log__content">
                <div className="workflow-log__title">{entry.title}</div>
                <div className="workflow-log__detail">{entry.detail}</div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
