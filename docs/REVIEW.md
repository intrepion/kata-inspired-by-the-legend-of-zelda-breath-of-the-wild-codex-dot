# Separate implementation reviews

Matt Pocock's code-review workflow was applied with independent Standards and Specification subagents. Because this was a new empty repository, the fixed point was Git's empty tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904, compared to implementation commit f9ea4a3 with `git diff 4b825dc642cb6eb9a060e54bf8d69288fbee4904 HEAD`. The specification was docs/SPEC.md and the standards source was CODING_STANDARDS.md. This adapts the request for a user-selected baseline to the authorized new-repository scope.

## Standards

Two documented breaches found: insufficient save progress validation and camera drag retained across focus loss/pause. Both fixed. The reviewer verified integer counters, shard accounting, berry bounds, beacon prerequisites and camera cleanup; no remaining hard standards violations were identified.

Judgment smells recorded: duplicated prompt/action resolution, repeated numeric beacon identities, broad UI entry module and reliance on renderer child positions. Named rune references replaced manual children-array reassignment. The remaining small-world numeric identities and UI adapter grouping are accepted for this compact slice; they are refactor opportunities, not failed acceptance criteria.

## Specification

Two findings found: inconsistent saves could bypass trial prerequisites; lethal falling damage could overwrite recovery altitude/message with those of the landing site. Both fixed. Regression tests failed first with forged inventory and a 22.38-unit recovery altitude discrepancy, then passed after the fixes. The independent specification reviewer verified the fixes and reported no remaining concrete static specification issue.

## Outcome

Initial findings: Standards 2 hard findings plus 4 judgment suggestions; Specification 2 findings. Remaining hard findings after verification: 0 on either axis. Browser coverage and duration limitations are documented separately in QA.md.
