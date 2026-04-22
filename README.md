# HR Workflow Designer

Production-quality prototype for designing HR workflows with React, TypeScript, React Flow, Zustand, React Hook Form, and a local mock API layer.

## How To Run

```bash
npm install
npm run dev
```

### Additional Commands

```bash
npm run build
npm run lint
npm run preview
```

## Architecture

- `src/components` contains the shell, canvas, sidebar, config panel, and simulation panel.
- `src/nodes` contains reusable React Flow node renderers.
- `src/forms` contains fully typed node configuration forms.
- `src/hooks` exposes `useWorkflow`, `useNodeConfig`, and `useValidation`.
- `src/store` holds the Zustand store for nodes, edges, selection, and history.
- `src/api` contains the local mock API used for automations and simulation.
- `src/utils` contains workflow validation, auto-layout, and JSON import/export helpers.
- `src/types` defines the workflow interfaces and node shapes.

## Design Decisions

- The canvas is fully controlled, so node and edge state is centralized and easy to serialize.
- Workflow nodes are discriminated by `kind` and `type` for strong TypeScript narrowing.
- Validation and connection rules are isolated from UI so they can be reused by the editor and the simulation layer.
- The mock API is local and deterministic, which keeps the prototype simple and production-friendly for demos.
- Store actions are wrapped by custom hooks (`useWorkflow`, `useNodeConfig`, `useValidation`) to keep UI components thin and easy to extend.
- Layout behavior is encapsulated in a dedicated utility (`autoLayoutNodes`) and exposed via store action for scalability.

## Assessment Criteria Coverage

| Area | What was implemented |
| --- | --- |
| React Flow proficiency | Custom typed nodes, drag-and-drop node creation, edge connections, selection, delete node/edge, minimap, controls, and fit view. |
| React architecture | Modular folder structure, reusable presentational components, custom hooks for workflow/config/validation, Zustand store for centralized graph state and history. |
| Complex form handling | Dynamic node-specific forms with React Hook Form, typed form models, required field validation, dynamic automated action parameters from API metadata. |
| Mock API interaction | Local mock API layer with `GET /automations` and `POST /simulate` behavior, async simulation flow, typed responses, loading/error states, and UI-safe handling. |
| Scalability | Strong TypeScript domain models, discriminated unions for node data, validation and connection policies isolated in utils, auto-layout utility, and import/export serialization utilities. |
| Communication | This README documents architecture, run instructions, design decisions, coverage, assumptions, and next steps. |
| Delivery speed | Core and bonus features shipped in an end-to-end working prototype with local run + build verification. |

## What Was Completed

- React Flow canvas with drag-and-drop node creation.
- Custom typed nodes for Start, Task, Approval, Automated, and End.
- Dynamic config panels powered by React Hook Form.
- Workflow validation for missing starts, missing ends, dangling edges, and cycles.
- Connection guardrails (no start-node incoming, no end-node outgoing, no duplicate edges, no self loops).
- JSON export/import for workflow snapshots.
- Simulation logs generated from the mock API.
- Undo/redo history support.
- One-click auto-layout for graph organization.
- Instructions modal and responsive layout hardening with wrap/overflow-safe styles for small screens.

## What I Would Add With More Time

- Advanced layout strategies (Dagre/ELK) and layout direction controls (LR/TB).
- Validation overlays directly on invalid nodes/edges in-canvas.
- Persisted workflows (local storage + remote save/load adapter).
- Test coverage (unit tests for validators/store actions, integration tests for key flows).
- Accessibility pass (keyboard-only flow building and richer ARIA labels).
- Performance optimizations for large graphs (memoized selectors, virtualized side panels).

## Assumptions

- The mock API is intentionally local to keep this prototype self-contained and deterministic.
- Focus is on extensible architecture and end-to-end behavior rather than pixel-perfect parity with any single design system.
- The app starts with a sample onboarding workflow so behavior is immediately demoable.
