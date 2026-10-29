# contract/

Shared JSON shapes between the Go engine and the Next.js web app.

`Row` and the timeseries point are defined as **Go structs with json tags**
(see `engine/internal/flip` and `engine/internal/source`). TypeScript types are
**generated** from those structs into `*.generated.ts` here so the two sides
never drift.

Generated files (`*.generated.ts`) are git-ignored — run codegen as part of the
build. Until the codegen step is wired up, the web app declares the shapes
inline in `web/lib/engine.ts`.
