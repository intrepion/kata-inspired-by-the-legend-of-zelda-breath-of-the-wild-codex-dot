# Standards

Use strict TypeScript. Keep gameplay rules independent of Three.js and DOM. Commands represent actual player actions; no production debug teleport or grant-completion hooks. Save decoding accepts only finite bounded world positions and validated progress. Clamp frame delta and clear inputs on focus loss. Original procedural assets only. Browser event handlers must support touch release/cancellation. Document test limitations rather than claiming unperformed coverage.
