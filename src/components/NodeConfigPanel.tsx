import { ApprovalNodeForm } from "../forms/ApprovalNodeForm";
import { AutomatedNodeForm } from "../forms/AutomatedNodeForm";
import { EndNodeForm } from "../forms/EndNodeForm";
import { StartNodeForm } from "../forms/StartNodeForm";
import { TaskNodeForm } from "../forms/TaskNodeForm";
import { useNodeConfig } from "../hooks/useNodeConfig";
import {
  isApprovalNodeData,
  isAutomatedNodeData,
  isEndNodeData,
  isStartNodeData,
  isTaskNodeData,
  type WorkflowNode,
} from "../types/workflow";

interface NodeConfigPanelProps {
  onClearSelection: () => void;
}

export function NodeConfigPanel({ onClearSelection }: NodeConfigPanelProps) {
  const {
    selectedNode,
    automationOptions,
    isLoadingAutomations,
    automationsError,
    updateNodeData,
  } = useNodeConfig();

  const saveNode = (nodeId: string, data: WorkflowNode["data"]) => {
    updateNodeData(nodeId, data);
  };

  if (!selectedNode) {
    return (
      <aside className="panel panel--config">
        <div className="panel__section">
          <div className="panel__heading">Node configuration</div>
          <p className="workflow-muted">
            Select a node to edit its typed configuration.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="panel panel--config">
      <div className="panel__section panel__section--header node-config-header">
        <div className="node-config-header__meta">
          <div className="eyebrow">Selected node</div>
          <h2 className="panel__title panel__title--compact">
            {selectedNode.data.title}
          </h2>
        </div>
        <button
          type="button"
          className="workflow-icon-button"
          onClick={onClearSelection}
        >
          Deselect
        </button>
      </div>

      <div className="panel__section">
        {isStartNodeData(selectedNode.data) && (
          <StartNodeForm
            value={selectedNode.data}
            onSave={(data) => saveNode(selectedNode.id, data)}
          />
        )}
        {isTaskNodeData(selectedNode.data) && (
          <TaskNodeForm
            value={selectedNode.data}
            onSave={(data) => saveNode(selectedNode.id, data)}
          />
        )}
        {isApprovalNodeData(selectedNode.data) && (
          <ApprovalNodeForm
            value={selectedNode.data}
            onSave={(data) => saveNode(selectedNode.id, data)}
          />
        )}
        {isAutomatedNodeData(selectedNode.data) && (
          <>
            {isLoadingAutomations ? (
              <div className="workflow-muted">Loading automation actions...</div>
            ) : null}
            {automationsError ? (
              <div className="workflow-alert workflow-alert--error">
                <div className="workflow-alert__error">{automationsError}</div>
              </div>
            ) : null}
            <AutomatedNodeForm
              value={selectedNode.data}
              actions={automationOptions}
              onSave={(data) => saveNode(selectedNode.id, data)}
            />
          </>
        )}
        {isEndNodeData(selectedNode.data) && (
          <EndNodeForm
            value={selectedNode.data}
            onSave={(data) => saveNode(selectedNode.id, data)}
          />
        )}
      </div>
    </aside>
  );
}
