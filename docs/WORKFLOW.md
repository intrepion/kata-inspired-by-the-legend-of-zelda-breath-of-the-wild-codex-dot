# Workflow and decision analysis

Read local personal skills at /Users/intrepion/.agents/skills and verified current official Matt Pocock skills on 2026-10-11: engineering/grill-with-docs, engineering/implement, productivity/grilling, engineering/domain-modeling, engineering/tdd and engineering/code-review.

Official entry points:
- https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md
- https://github.com/mattpocock/skills/blob/main/skills/engineering/implement/SKILL.md

No interactive interview occurred. The user's explicit no-questions instruction supersedes the skills' interview and seam-confirmation prompts. Recommended decisions are adopted and recorded here rather than attributed to user answers.

Decision tree: original wilderness adventure → compact landmark valley → third-person browser 3D → analytic terrain and simple obstacle collision → three distinct trials → persistent command simulation → renderer, keyboard and touch adapters. Completion requires all three beacons, so interrupted or repeated trials cannot grant a premature finale. Defeat preserves objectives and restores health at a discovered beacon. Invalid saves fall back to a new journey.

Test seams chosen under that authorization: public Game commands and update (catches movement/resource/combat/objective rules, misses rendering), save codec (catches malformed and interrupted state, misses browser permission policy), actual browser input (catches integration/camera/presentation). TDD uses one failing behavioral slice, then implementation, then the next slice. Separate Standards and Specification reviewers examine the initial implementation from the empty-repository baseline.

TDD evidence: the first movement test failed before Game existed; the resource offering test failed before interact existed; the codec test failed before save.ts existed. Other traversal/puzzle/combat checks were acceptance tests added around the implemented vertical slice. The two review regression tests were demonstrably red before their fixes and green afterward. This is targeted TDD, not a claim that every line was written test-first. The command model exposes its observable state; tests seed scenarios through that public state, while browser QA uses ordinary controls only.

The code-review skill explicitly called for independent parallel subagents; those two reviewers were used for Standards and Specification. Their fixed point is the empty Git tree for this new repository. No issue tracker was needed for the direct user request: docs/SPEC.md is the originating spec. No interactive interview or seam-confirmation conversation is claimed.
