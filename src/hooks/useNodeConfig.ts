import { useEffect, useMemo, useState } from "react";
import { getAutomations } from "../api/mockApi";
import { useWorkflow } from "./useWorkflow";

export const useNodeConfig = () => {
  const { nodes, selectedNodeId, updateNodeData } = useWorkflow();
  const [automationOptions, setAutomationOptions] = useState<
    Awaited<ReturnType<typeof getAutomations>>
  >([]);

  useEffect(() => {
    let active = true;

    getAutomations().then((actions) => {
      if (active) {
        setAutomationOptions(actions);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  return {
    selectedNode,
    automationOptions,
    updateNodeData,
  };
};
