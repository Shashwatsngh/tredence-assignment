import { useShallow } from "zustand/react/shallow";
import { useWorkflowStore } from "../store/workflowStore";

export const useWorkflow = () =>
  useWorkflowStore(
    useShallow((state) => ({
      name: state.name,
      nodes: state.nodes,
      edges: state.edges,
      selectedNodeId: state.selectedNodeId,
      setName: state.setName,
      setSelectedNodeId: state.setSelectedNodeId,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      onConnect: state.onConnect,
      addNode: state.addNode,
      updateNodeData: state.updateNodeData,
      removeNodes: state.removeNodes,
      removeEdges: state.removeEdges,
      loadWorkflow: state.loadWorkflow,
      exportWorkflow: state.exportWorkflow,
      undo: state.undo,
      redo: state.redo,
    })),
  );
