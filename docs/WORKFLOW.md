# Workflow and decision analysis

Read local personal skills at /Users/intrepion/.agents/skills and verified current official Matt Pocock skills on 2026-10-11: engineering/grill-with-docs, engineering/implement, productivity/grilling, engineering/domain-modeling, engineering/tdd and engineering/code-review.

Official entry points:
- https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md
- https://github.com/mattpocock/skills/blob/main/skills/engineering/implement/SKILL.md

No interactive interview occurred. The user's explicit no-questions instruction supersedes the skills' interview and seam-confirmation prompts. Recommended decisions are adopted and recorded here rather than attributed to user answers.

Decision tree: original wilderness adventure → compact landmark valley → third-person browser 3D → analytic terrain and simple obstacle collision → three distinct trials → persistent command simulation → renderer, keyboard and touch adapters. Completion requires all three beacons, so interrupted or repeated trials cannot grant a premature finale. Defeat preserves objectives and restores health at a discovered beacon. Invalid saves fall back to a new journey.

Test seams chosen under that authorization: public Game commands and update (catches movement/resource/combat/objective rules, misses rendering), save codec (catches malformed and interrupted state, misses browser permission policy), actual browser input (catches integration/camera/presentation). TDD uses one failing behavioral slice, then implementation, then the next slice. Separate Standards and Specification reviewers examine the initial implementation from the empty-repository baseline.
