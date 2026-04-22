import { useEffect, useMemo, useState } from "react";
import { getAutomations } from "../api/mockApi";
import { useWorkflow } from "./useWorkflow";

export const useNodeConfig = () => {
  const { nodes, selectedNodeId, updateNodeData } = useWorkflow();
  const [automationOptions, setAutomationOptions] = useState<
    Awaited<ReturnType<typeof getAutomations>>
  >([]);
  const [isLoadingAutomations, setIsLoadingAutomations] = useState(true);
  const [automationsError, setAutomationsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getAutomations()
      .then((actions) => {
        if (active) {
          setAutomationOptions(actions);
        }
      })
      .catch((error) => {
        if (active) {
          setAutomationsError(
            error instanceof Error
              ? error.message
              : "Failed to load automation actions.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingAutomations(false);
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
    isLoadingAutomations,
    automationsError,
    updateNodeData,
  };
};
