import { useCallback } from "react";

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstructionsModal({ isOpen, onClose }: InstructionsModalProps) {
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Welcome to Workflow Studio</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close instructions"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <section className="instructions-section">
            <h3>Getting Started</h3>
            <div className="instructions-list">
              <div className="instruction-item">
                <div className="instruction-number">1</div>
                <div>
                  <strong>Add Nodes</strong>
                  <p>
                    Drag node types from the left sidebar onto the canvas to
                    build your workflow logic.
                  </p>
                </div>
              </div>

              <div className="instruction-item">
                <div className="instruction-number">2</div>
                <div>
                  <strong>Connect Nodes</strong>
                  <p>
                    Click and drag from the handle on one node to another node's
                    handle to create edges and define flow direction.
                  </p>
                </div>
              </div>

              <div className="instruction-item">
                <div className="instruction-number">3</div>
                <div>
                  <strong>Edit Node Configuration</strong>
                  <p>
                    Click a node to select it. Use the right panel to edit its
                    properties (title, description, assignee, etc.).
                  </p>
                </div>
              </div>

              <div className="instruction-item">
                <div className="instruction-number">4</div>
                <div>
                  <strong>Delete Node or Edge</strong>
                  <p>
                    Select the node or edge you want to remove, then press
                    Delete or Backspace. You can also use the "Delete selected"
                    button in the header.
                  </p>
                </div>
              </div>

              <div className="instruction-item">
                <div className="instruction-number">5</div>
                <div>
                  <strong>Simulate Workflow</strong>
                  <p>
                    Click "Simulate workflow" to run the workflow and see how it
                    progresses step by step. Watch nodes highlight as they
                    execute.
                  </p>
                </div>
              </div>

              <div className="instruction-item">
                <div className="instruction-number">6</div>
                <div>
                  <strong>Check Compliance & Analytics</strong>
                  <p>
                    Use the left sidebar to navigate between Dashboard,
                    Compliance, Scheduler, and Analytics views for insights
                    about your workflow.
                  </p>
                </div>
              </div>

              <div className="instruction-item">
                <div className="instruction-number">7</div>
                <div>
                  <strong>Dark Mode</strong>
                  <p>
                    Toggle between light and dark themes using the "Dark mode" /
                    "Light mode" button in the header. Your preference is saved.
                  </p>
                </div>
              </div>

              <div className="instruction-item">
                <div className="instruction-number">8</div>
                <div>
                  <strong>Export & Import</strong>
                  <p>
                    Export your workflow as JSON using "Export JSON". Later,
                    import it back with "Import JSON" to restore your work.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="instructions-section">
            <h3>Canvas Rules</h3>
            <ul className="instructions-rules">
              <li>Only one Start node is allowed per workflow.</li>
              <li>
                Cycles (loops) are detected and flagged during simulation.
              </li>
              <li>
                Each node type has typed configuration specific to its purpose.
              </li>
              <li>
                An End node is required to define workflow completion criteria.
              </li>
            </ul>
          </section>

          <section className="instructions-section">
            <h3>Keyboard Shortcuts</h3>
            <div className="shortcuts-grid">
              <div className="shortcut-item">
                <kbd>Delete</kbd> or <kbd>Backspace</kbd>
                <span>Delete selected node or edge</span>
              </div>
              <div className="shortcut-item">
                <kbd>Shift</kbd>
                <span>Multi-select nodes or edges</span>
              </div>
              <div className="shortcut-item">
                <kbd>Scroll</kbd>
                <span>Zoom in and out on canvas</span>
              </div>
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="workflow-primary-button"
            onClick={onClose}
          >
            Got it! Start building
          </button>
        </div>
      </div>
    </div>
  );
}
