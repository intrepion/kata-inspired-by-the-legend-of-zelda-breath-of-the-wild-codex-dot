# 0001: Deterministic browser world and command simulation

Status: accepted under the user's instruction to make recommended choices.

Choose TypeScript, Three.js and Vite with a deterministic terrain function and a renderer-independent gameplay command seam. A full physics engine and imported assets would offer broader production tooling but add installation and tuning overhead. Analytic terrain makes elevation, saves and tests share the same world; obstacle circles bound the handcrafted ruins. The cost is no rigid-body physics or destructible scenery.

Persistence is versioned local storage with defensive decoding. This is offline single-player; no services, accounts, analytics or deployment are needed.
