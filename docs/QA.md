# Verification evidence — 2026-10-11

## Automated

Ten passing Vitest tests at the public gameplay command and save codec seams:

1. Sprint spends stamina; rest restores it.
2. Each shard can be collected once; an offering requires five and spends them once.
3. Incorrect dials and incomplete sentinels block their beacons; all currents are required for the finale.
4. Jump/glide and defeat recovery preserve discoveries.
5. Save round-trip, invalid JSON/version and out-of-bounds rejection.
6. Sentinel warning precedes damage; retreat avoids the marked strike.
7. Forged inventory, fractional health and unearned beacons are rejected.
8. Lethal highland falling damage recovers at the checkpoint altitude.
9. Steep ground blocks ordinary walking and permits stamina climbing.
10. Beacon collision and world boundaries constrain movement.

Strict TypeScript and production build pass. Dependency audit: zero vulnerabilities after upgrading Vite/Vitest. Vite reports a bundle-size advisory (~534 kB uncompressed / 138 kB gzip); the game has no external content fetches or runtime services.

## Actual Mac browser play

Used the user's Chrome through the computer-use tools at http://127.0.0.1:5174/. Desktop viewport was 1200 × 698. Used normal input only, without teleport, inventory grants, completion flags or save editing.

- Started at the arrival; walked to and collected five distinct meadow shards.
- Repeated gather input did not duplicate collection. Offered at Meadow; repeated interaction rested without spending again.
- Reloaded: meadow beacon, consumed shards, inventory and position persisted.
- Traversed to the highland, read the Sun/Moon/Star clue, turned each dial and activated Wind Observatory.
- Jumped and opened glider, flew from the highland. Ran out of stamina during the QA interruption; hard landing cost one heart. Healed with R.
- Approached sentinels; visible warning rings and damage were observed. Standing idle during tool calls caused defeat, which recovered at Wind Observatory with both beacon discoveries intact.
- Returned and quieted all three sentinels with timed F presses. Restored Sentinel Court; reached Heartspire and interacted to display the finale.
- Continued exploring, repeated finale interaction, reloaded: all four completion marks and inventory persisted; finale overlay did not reopen automatically.
- Tested pause with a held movement key: position did not change. Tested new-journey cancellation, then actual reset: all objectives and resources returned to initial values.
- Tested camera drag and sound toggle. No app JavaScript error appeared in captured logs; unrelated extension warnings were present.

## Mobile presentation and controls

Chrome viewport override 390 × 844 on the same Mac. Visually inspected the scene, readable HUD, touch controls, map, prompt and menus. Held the on-screen forward and backward buttons; observed changed coordinates. Clicked jump twice and saw the gliding state, clicked strike/interact, toggled sound, expanded destinations, selected the highland and collapsed the list. Refined the mobile HUD to keep destinations collapsed by default and increased button targets to 44 px. Restored the desktop viewport afterward.

## Screenshots

- [Title](screenshots/title-desktop.jpg)
- [Valley](screenshots/valley-desktop.jpg)
- [Heartspire](screenshots/heartspire-desktop.jpg)
- [Verified finale](screenshots/finale-desktop.jpg)
- [Mobile controls](screenshots/mobile-controls.jpg)

## Limits

This was a directed QA route, not a blind first-time duration study; the 10–15 minute exploration target is not a measured guarantee. Mobile QA is responsive Chrome on the Mac, not physical iOS/Android hardware. Audible quality, storage-denial mode, older GPUs, full assistive-technology gameplay and other browsers were not manually assessed. Combat is intentionally a compact three-sentinel encounter; terrain uses analytic height and simple obstacle collisions, with no rigid-body simulation. The map is compact, with no full open-world quest system.

No supported Codex project-registration control was exposed. Sidebar registration was not performed. The repository was created private; no deployment or paid service was used. Driftwood Bay's repository and port 5173 were untouched.
