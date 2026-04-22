# HR Workflow Designer

Production-quality prototype for designing HR workflows with React, TypeScript, React Flow, Zustand, React Hook Form, and a local mock API layer.

## Run

```bash
npm install
npm run dev
```

## Architecture

- `src/components` contains the shell, canvas, sidebar, config panel, and simulation panel.
- `src/nodes` contains reusable React Flow node renderers.
- `src/forms` contains fully typed node configuration forms.
- `src/hooks` exposes `useWorkflow`, `useNodeConfig`, and `useValidation`.
- `src/store` holds the Zustand store for nodes, edges, selection, and history.
- `src/api` contains the local mock API used for automations and simulation.
- `src/utils` contains workflow validation and JSON import/export helpers.
- `src/types` defines the workflow interfaces and node shapes.

## Design Decisions

- The canvas is fully controlled, so node and edge state is centralized and easy to serialize.
- Workflow nodes are discriminated by `kind` and `type` for strong TypeScript narrowing.
- Validation is isolated from UI so it can be reused by the editor and the simulation layer.
- The mock API is local and deterministic, which keeps the prototype simple and production-friendly for demos.

## Features Included

- React Flow canvas with drag-and-drop node creation.
- Custom typed nodes for Start, Task, Approval, Automated, and End.
- Dynamic config panels powered by React Hook Form.
- Workflow validation for missing starts, missing ends, dangling edges, and cycles.
- JSON export/import for workflow snapshots.
- Simulation logs generated from the mock API.

## Notes

The app starts with a sample onboarding workflow so the Task node flow is immediately visible and editable.
