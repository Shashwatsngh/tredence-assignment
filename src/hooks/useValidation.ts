import { useMemo } from "react";
import { useWorkflow } from "./useWorkflow";
import { validateWorkflow } from "../utils/workflowValidation";

export const useValidation = () => {
  const { nodes, edges } = useWorkflow();

  return useMemo(() => validateWorkflow(nodes, edges), [nodes, edges]);
};
