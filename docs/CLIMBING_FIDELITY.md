# Windward Lookout climbing slice — 2026-10-15

Baseline `43c94193b8a3925ba345fcea1cbfdb47d7bdc915` was clean. Existing local preview 5174 remains available. This focused correction gives the existing third-person orbit-camera adventure one actual vertical climb-to-glide route.

## Research and decisions

Nintendo's [Eldin exploration guide](https://www.nintendo.com/sg/zelda/botw/discovery/eldin.html), especially “Don't Move” and Gut Check Rock, documents stationary clinging without fatigue, inspecting routes above and sideways, and climbing a sheer wall for a reward. The same primary guide describes gliding from a high point. These are the gameplay contracts adopted here. Numerical speeds/costs are authored approximations, not measured Nintendo formulas.

Under the user's Grill with Docs / Implement recommended-default authorization, add one explicit cylindrical surface east of arrival rather than recategorizing the old sprint-uphill slope as climbing. Existing beacon paths, objective order and campaign saves remain compatible. No interactive answers are claimed.

## Implemented mechanics

- Walk into the marked lookout wall to attach. Camera-relative WASD/arrows project into vertical and lateral movement around its surface. Moving spends stamina; a stationary cling neither spends nor restores it. Space jumps away; C / Let go releases without a jump. Exhaustion releases into normal gravity and existing hard-landing/recovery rules.
- At the lip the wayfarer moves onto a standable roof. The existing optional shard at index 11 is relocated there and requires matching elevation, preserving the fixed twelve collectible identities and all previous collected flags. Other eleven shards and the five-shard offering retain their rules.
- Resting on the roof restores stamina. Jump, open the glider, and steer south to the marked green ground circle. A completed soft landing reports its result. Opening the glider cancels upward velocity so repeated toggles cannot create lift.
- Geometry, collision, reward altitude and save recovery share the pure world definitions. Frame updates subdivide into at most 50ms simulation steps, including existing bounded large-delta test calls. Movement, jump/drop/reset and the save codec remain independent of Three.js/DOM.
- The existing `aster-vale-v1` save schema/key is retained. Contact/flight are transient. Reloading returns to terrain as before; a saved position within the new solid is safely moved outside it. Discoveries, inventory, checkpoints and ending are preserved, including already-collected shard 11. Reloading on the roof requires climbing again. New Journey clears all new transient state.
- The destination list, minimap, field guide, motion status, visible handholds and terrain-following landing ring expose the route through ordinary controls. The existing drag orbit/follow camera is retained.

## Planned normal-input acceptance route

1. Enter or continue the valley at http://localhost:5174. Select Windward Lookout in Destinations. From arrival walk northeast to the visible marked tower (23E / 53S). With the default north-facing camera, approach its south face with W.
2. Hold toward the wall to climb. Stop midway: observe stable altitude and stamina. Traverse sideways; press away to descend. Let go with C and confirm real falling; reattach after landing. In a second attempt spend stamina through movement until exhausted and recover normally.
3. Climb to the lip, stand on the roof, E gathers the raised shard, and rest until the stamina meter fills. Jump with Space; press Space again in the air to glide. With default orbit hold S toward the green circle south of the lookout, steering as needed. Land and inspect the completion message. Repeat with the touch Jump / Glide and Let go controls when the viewport offers them.
4. Pause/blur during a climb and resume without continued movement input. Save/reload and confirm progress survives while the character returns safely outside the wall; an old completed save retains its ending/checkpoints.
5. Continue a normal beacon objective to check that the optional route did not replace the three-current campaign.

## Checks and limitations

17 focused/existing tests pass: attach/ascend, stationary/lateral cling, exhaustion/fall, jump-away/glider, top-out/elevated reward/landing, no reward through the wall, safe v1 reload, release/reset, plus previous combat/objective/save regressions. Strict TypeScript, production build (`index-oW3XsJ_R.js`) and `git diff --check` also passed. The existing monolithic Three.js bundle emits a size warning, without a build failure. Independent Standards and Specification reviews passed. The ordinary-input lookout climb/shard/glide-landing/reload route passed after manual unlock and exclusive access regrant; exact native coverage and unverified exhaustion/jump-away edges are in [local acceptance](LOCAL_ACCEPTANCE_2026-10-15.md). Simulation fixtures seed a route approach position; they are not browser evidence.

Only Windward Lookout is an authored climbable vertical surface. Arbitrary mesh/terrain climbing, rain/slipping, grip animations, climbing upgrades/food, ledge scanning, original speed/formulas, the original combat/rune systems and full Hyrule are outside this correction. Existing sloped highland traversal still uses stamina sprinting. The optional glide landing is feedback rather than a new saved campaign gate.


Native acceptance attempt 2026-10-15T11:24:27.423261+00:00: after exclusive access was granted, the initial computer-use inventory reported that the Mac is locked and could not be unlocked automatically. No tab or game interaction occurred. At that historical attempt this project’s normal-input acceptance was unverified; the worker stopped input and released access to the parent. After manual unlock and explicit exclusive-access regrant, the completed native route superseded that pending status. Existing source/tests/build results remain valid. No security changes or keep-awake workaround was attempted.


## Observed native acceptance — completed 2026-10-15

Third-person following camera; normal wall approach/cling, stationary stamina, lateral traversal, drop, roof shard, southward glider landing and reload passed. The attempted exhaustion was confounded by successful top-out; native depletion/fall and jump-away are not claimed. Full observed sequence, reload results, screenshots and limits: [local acceptance](LOCAL_ACCEPTANCE_2026-10-15.md). No source changes or rebuild were needed during native QA. Dedicated QA tab closed and exclusive access released; preview left available.
