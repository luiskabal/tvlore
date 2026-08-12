# TVLore — Loop Engineering Retrofit v1

We are evolving the existing TVLore repository toward a practical **Loop Engineering / agentic software development workflow**.

This is NOT a greenfield project.

You have already worked extensively on this repository and have significant historical context about its architecture, conventions, previous decisions, and development workflow.

Use that prior context when useful, but always verify assumptions against the current repository state.

The objective is to improve the development harness around the application so future work can increasingly follow:

**task → build → verify → review → fix → verify → done**

without requiring constant manual prompting between every step.

Do not over-engineer this.

---

# Current Known Context

Repository:

`https://github.com/luiskabal/tvlore`

Local repository:

`D:\tvlore`

Primary branch:

`main`

Current monorepo structure includes:

```text
apps/
  api/
  mobile/

packages/
  contracts/

docs/
```

## Mobile

* React Native
* Expo
* Expo Router
* TypeScript
* Expo development builds
* currently tested primarily on a physical iPhone
* Supabase Auth
* Google OAuth
* SecureStore / AsyncStorage where applicable

This is NOT React Native CLI-only.

This is NOT Flutter.

This is NOT native SwiftUI.

## Backend

* deployed to Vercel
* production/backend URL:

`https://tvlore-api.vercel.app`

* Supabase Postgres
* Supabase Auth
* backend tests using Vitest

## Existing validation

The project already has meaningful tests and validation.

Known commands include:

```powershell
corepack pnpm typecheck
corepack pnpm api:check
```

There are also backend Vitest tests and existing smoke/functional verification.

Do NOT assume the project lacks tests.

Inspect and reuse the existing test infrastructure.

## Current development workflow

Our current workflow has generally been:

1. justify a plan
2. implement a small coherent increment
3. run typecheck/tests/smoke checks
4. update documentation/backlog when relevant
5. commit
6. push to `main`
7. human validation on iPhone and/or Postman

Codex currently:

* operates directly against the local repo
* uses PowerShell
* modifies code and documentation
* runs commands
* creates commits
* pushes to GitHub

There is currently no formal GitHub Actions CI pipeline.

Vercel is connected to GitHub for deployment.

---

# Main Objective

Perform a **Loop Engineering readiness assessment and minimal retrofit** of the current TVLore repository.

The repository itself should progressively become a harness capable of supporting increasingly autonomous agent work.

The desired long-term workflow is:

```text
Feature Specification
        ↓
Builder Agent
        ↓
Implementation
        ↓
Deterministic Verification
        ↓
Reviewer Agent
        ↓
Blocking issue?
   ┌────┴────┐
   │         │
  YES        NO
   │         │
Builder Fix  DONE
   │
Verification
   │
Review
   └────── loop
```

For mobile/frontend work, we will eventually extend this toward:

```text
Implement
   ↓
Static Verification
   ↓
Behavior Verification
   ↓
Visual Verification
   ↓
Review
   ↓
Fix
   ↓
Repeat
```

Do NOT attempt to fully automate that entire visual/mobile loop in this task.

Prepare the foundation.

---

# Phase 1 — Inspect Current Reality

Before making modifications, perform a repository-wide inspection.

Use the implementation as the source of truth.

Identify the current:

* monorepo architecture
* package manager/workspace configuration
* mobile architecture
* Expo configuration
* Expo Router structure
* navigation conventions
* authentication flow
* Google OAuth implementation
* session lifecycle
* SecureStore usage
* AsyncStorage usage
* API client architecture
* contracts between mobile and backend
* backend architecture
* endpoint organization
* validation strategy
* database access
* Supabase integration
* domain entities
* movie/TV provider integration
* search flow
* media details flow
* watched/unwatched flow
* persistence behavior
* error handling
* environment-variable strategy
* testing architecture
* unit tests
* integration tests
* smoke tests
* scripts
* linting
* type checking
* build validation
* documentation
* backlog/project documentation
* Git conventions
* existing Codex/agent instructions if any

Do not redesign anything during this inspection.

---

# Phase 2 — Assess Loop Readiness

Determine what TVLore ALREADY has that enables agentic development.

Examples include:

* strong test coverage
* type checking
* API checks
* shared contracts
* smoke tests
* architectural conventions
* documentation
* repeatable commands
* deterministic outputs

Then identify actual gaps.

Do NOT invent problems simply because a theoretical Loop Engineering setup could contain more infrastructure.

Pay particular attention to whether a future autonomous agent can answer:

> How do I know this task is actually done?

Assess the clarity of:

* Definition of Done
* required validation
* task acceptance criteria
* architecture boundaries
* regression protection
* test selection
* mobile validation
* backend validation
* documentation expectations
* human approval boundaries

---

# Phase 3 — Establish AGENTS.md

Inspect whether `AGENTS.md` or equivalent agent instructions already exist.

If useful, create or improve a repository-root:

`AGENTS.md`

Keep it concise and operational.

It should NOT become a giant architecture document.

It should tell future agents HOW to work inside TVLore.

Include principles such as:

## Inspect before changing

Understand the existing implementation before introducing new patterns.

## Incremental development

Prefer the smallest coherent change that satisfies the task.

## Preserve architecture

Do not perform unrelated refactors or architectural rewrites.

## Existing conventions win

Follow established repository patterns unless there is a concrete reason not to.

## No speculative dependencies

Do not add libraries simply because they might be useful later.

## Contracts matter

Respect the role of `packages/contracts` and existing API/mobile boundaries.

## Verification before completion

A coding task cannot be declared complete until the required verification passes.

## No fake success

Never claim completion when task-related tests, type checking, builds, or required validation are failing.

## Documentation

Update documentation when a change materially alters documented behavior or architecture.

Do not generate documentation churn for trivial implementation details.

---

# Phase 4 — Human Gates

Define clear boundaries for decisions Codex should NOT make autonomously.

At minimum, surface these for human approval before proceeding:

* major authentication architecture changes
* changing Supabase as auth/database provider
* destructive database operations
* destructive migrations
* substantial schema redesigns
* security/privacy model changes
* changing OAuth behavior
* new paid external services
* major new dependencies
* major architecture rewrites
* changing API provider strategy
* production deployment behavior
* data-loss risks
* public API breaking changes
* secrets-management changes
* irreversible Git operations

Routine implementation work should NOT require unnecessary approval.

The purpose is selective human oversight, not constant human interruption.

---

# Phase 5 — Create a Unified Verification Contract

Inspect all existing scripts and determine the most useful deterministic verification interface.

Prefer reusing existing commands.

Known existing commands include:

```powershell
corepack pnpm typecheck
corepack pnpm api:check
```

There are already backend tests.

Determine whether introducing standardized commands such as these would improve the loop:

```powershell
corepack pnpm verify
corepack pnpm verify:full
```

Do NOT blindly create them if equivalent commands already exist.

The likely intent is:

## `verify`

Fast enough to run frequently during autonomous iteration.

Potentially includes:

* type checking
* linting if configured
* backend/unit tests relevant to normal development
* API checks
* contract validation

## `verify:full`

More comprehensive verification suitable before merge/release.

Potentially includes:

* full test suite
* build checks
* broader integration/smoke validation
* additional workspace validation

Determine the correct distinction based on the actual repository.

Do not include expensive, flaky, credential-dependent, or physical-device-only checks in the normal inner loop unless they can run reliably.

The key property is:

```text
exit code 0
→ deterministic validation succeeded

non-zero exit code
→ agent must inspect and iterate
```

---

# Phase 6 — Add CI as a Loop Feedback Mechanism

There is currently no formal GitHub Actions CI.

Assess whether the existing project is sufficiently stable to introduce a minimal CI workflow now.

If yes, create a simple GitHub Actions workflow that reuses the SAME validation commands used locally.

Avoid duplicating validation logic inside YAML.

Prefer:

```text
local developer / Codex
        │
        └── pnpm verify

GitHub Actions
        │
        └── pnpm verify
```

rather than having different definitions of correctness.

The CI should initially remain simple.

Possible triggers:

* pull requests
* pushes to `main`

Use the repository's actual Node/pnpm/Corepack requirements.

Do not introduce deployment changes.

Do not modify the existing Vercel deployment strategy unless strictly required.

CI should initially be a verification system, not a deployment orchestrator.

---

# Phase 7 — Lightweight Feature Task Contract

Introduce a lightweight convention for future Loop Engineering tasks.

Do NOT build a custom project management framework.

If no equivalent already exists, create one template, for example:

`tasks/TEMPLATE.md`

or another location that better fits the existing repository.

A feature task should capture:

```md
# Feature

## Goal

The observable outcome we want.

## Context

Relevant current behavior and architecture.

## Requirements

Functional requirements.

## Acceptance Criteria

Observable conditions that prove the feature works.

## Verification

Specific automated/manual validation relevant to this feature.

## Out of Scope

Things this task must not change.

## Human Gates

Any decisions that require escalation.
```

Do NOT populate a fake backlog simply to demonstrate the structure.

One template is enough.

---

# Phase 8 — Prepare Builder / Reviewer Roles

Prepare the project for separate implementation and review passes.

Do NOT introduce CrewAI, AutoGen, LangGraph, queues, agent servers, or a custom orchestration platform.

At this stage, roles can remain instruction-based.

## Builder responsibility

The Builder:

1. reads the task
2. inspects relevant implementation
3. produces a small implementation plan
4. implements
5. runs required verification
6. fixes failures
7. reports completed changes

The Builder should not decide that architecture can be rewritten simply because another implementation seems cleaner.

## Reviewer responsibility

The Reviewer should independently inspect:

* feature specification
* acceptance criteria
* diff
* relevant implementation
* architecture constraints
* tests
* regression risk

The Reviewer should NOT assume the Builder is correct.

The Reviewer should classify findings as:

### BLOCKING

The task should not be considered complete.

Examples:

* acceptance criteria not met
* functional bug
* regression
* security problem
* broken contract
* incorrect persistence
* significant architecture violation
* missing required verification

### NON_BLOCKING

Improvement worth considering but not required to complete the task.

### APPROVED

No blocking findings.

If useful, create a lightweight reviewer instruction file or reusable task template.

Do not create redundant agent files simply for appearance.

---

# Phase 9 — Prepare for Mobile UI / Visual Loops

This is a React Native + Expo application.

Frontend work cannot eventually rely only on static code inspection.

Assess the existing project's readiness for future visual/behavioral agent loops.

The target future model is:

```text
Builder
   ↓
implement mobile UI
   ↓
typecheck/tests
   ↓
launch Expo application
   ↓
navigate to target screen
   ↓
capture/inspect UI
   ↓
visual/behavior reviewer
   ↓
fix
   ↓
repeat
```

Do NOT force full simulator/device automation during this retrofit.

Instead, identify practical next steps given that:

* development currently happens on Windows
* Codex uses PowerShell
* the app is currently tested mainly on a physical iPhone
* the project uses Expo development builds

Evaluate realistic future options for:

* automated mobile E2E
* screenshots
* UI regression
* navigation testing
* accessibility verification
* visual review
* running validation without depending exclusively on Luis manually testing on his iPhone

Document concrete recommendations.

Do NOT introduce major tooling in this task unless there is a clear low-risk win.

We want to understand the migration path first.

---

# Phase 10 — Preserve Existing Product Behavior

This retrofit must NOT introduce product features.

Do not implement:

* rating movies
* rating TV shows
* episode ratings
* episode comments
* social feeds
* reactions
* follows
* public creator systems
* QR social profiles
* taste matching
* recommendation engines

These are future product possibilities, not part of this infrastructure task.

However, use them as **architectural horizon context**.

Potential future TVLore capabilities may include:

```text
media tracking
        ↓
ratings
        ↓
episode tracking
        ↓
episode ratings
        ↓
comments/reactions
        ↓
public profiles
        ↓
QR/profile sharing
        ↓
taste profiles
        ↓
user-to-user compatibility
        ↓
creator/critic profiles
        ↓
recommendations
```

Do NOT implement these.

Do NOT prematurely build abstractions for them.

But if you discover a CURRENT architectural decision that would obviously make these future capabilities unnecessarily difficult, document the concern in the final assessment.

Do not refactor it automatically.

---

# Phase 11 — Favor Executable Truth

Apply this priority:

```text
executable test
>
deterministic script
>
type system
>
runtime validation
>
documentation
>
agent instruction
```

Documentation is useful, but Markdown alone is not Loop Engineering.

Whenever possible, encode important correctness properties in something executable.

Do not create documentation for facts that the repository already expresses clearly and deterministically.

---

# Phase 12 — Do Not Over-Engineer

Avoid introducing:

* LangGraph
* CrewAI
* AutoGen
* Temporal
* Redis queues
* message brokers
* custom multi-agent services
* agent databases
* complicated GitHub automation
* unnecessary monorepo tooling
* speculative test frameworks
* unnecessary abstraction layers

The target is:

# Loop Engineering v1

using primarily:

* Codex
* repository context
* AGENTS.md
* existing tests
* deterministic validation
* Git
* GitHub
* GitHub Actions
* task specifications
* review passes
* existing documentation

The repository itself is the initial harness.

---

# Phase 13 — Be Conservative With Existing Tests

This project already has substantial testing.

Do NOT generate large quantities of tests simply because this is an agentic retrofit.

Instead assess:

* what existing tests already protect
* whether important flows have meaningful coverage
* whether tests provide useful loop feedback
* whether test commands are easy for an agent to target
* whether failures clearly indicate what broke

Prefer improving test discoverability/execution over increasing test count without reason.

---

# Phase 14 — Git Workflow Assessment

The current workflow often commits and pushes directly to `main`.

Do NOT silently change this workflow.

Assess whether Loop Engineering would benefit from moving toward:

```text
task
 ↓
branch/worktree
 ↓
builder
 ↓
verify
 ↓
review
 ↓
PR
 ↓
CI
 ↓
merge
```

particularly once multiple agents begin working concurrently.

Document the recommendation.

If introducing CI, it is acceptable for CI to run against the current workflow.

Do not force a branch protection or PR-only migration during this retrofit unless explicitly asked.

We will evolve Git workflow separately.

---

# Phase 15 — Make Only the Minimum Useful Changes

After analysis, implement only the changes that clearly improve Loop Engineering readiness now.

Possible changes may include:

* `AGENTS.md`
* verification scripts
* minimal GitHub Actions CI
* lightweight task template
* small documentation improvements
* reviewer instructions

But these are examples, not requirements.

If an existing mechanism already solves a problem, reuse it.

Do not generate files simply to satisfy this prompt.

---

# Required Validation

After making changes:

1. run the appropriate existing project validation
2. run any new unified verification command if created
3. fix failures introduced by this retrofit
4. make sure the application behavior remains unchanged

Do not hide pre-existing failures.

If a pre-existing failure exists, clearly identify it separately from failures introduced by this task.

---

# Do NOT Commit Immediately

Before committing or pushing, stop after implementation and verification and provide the assessment/report below.

I want to inspect the retrofit before deciding whether it should be committed.

Do not push to `main` as part of this task unless explicitly instructed afterward.

---

# Final Report

Provide a concise but technically useful report with these sections.

## 1. Current Loop Readiness

Estimate how ready the existing repository already was for Loop Engineering.

Explain what infrastructure was already valuable.

Do not invent a numerical score unless it genuinely helps explain the assessment.

## 2. Existing Verification

List the important existing validation mechanisms discovered.

Explain what each actually protects.

## 3. Gaps Found

Only real gaps.

Separate:

* important now
* useful later

## 4. Changes Made

For every created or modified infrastructure/documentation file:

* file
* purpose
* reason

## 5. Verification Contract

Show the exact normal agent workflow, for example:

```powershell
corepack pnpm verify
```

and if applicable:

```powershell
corepack pnpm verify:full
```

Explain when each should run.

## 6. CI

Explain any CI added.

If CI was not added, explain why.

## 7. Builder Loop

Show the recommended concrete future loop:

```text
Task
↓
Plan
↓
Implement
↓
Verify
↓
Failure?
├─ yes → diagnose → fix → verify
└─ no
↓
Review
```

## 8. Reviewer Loop

Explain how a separate reviewer should evaluate the Builder's work.

## 9. Mobile / Visual Loop Readiness

Explain what is currently possible for autonomous React Native / Expo frontend iteration.

Clearly distinguish:

### possible now

from:

### requires additional tooling

Recommend the smallest practical next step toward allowing Codex to visually validate mobile UI.

## 10. Human Gates

List the decisions that should remain human-controlled.

## 11. Git Evolution

Recommend whether/when we should move from:

```text
Codex → main
```

toward:

```text
worktree/branch
→ Builder
→ Reviewer
→ PR
→ CI
→ merge
```

Do not implement that entire workflow unless necessary for this retrofit.

## 12. Future Product Architecture Risks

Considering the potential future direction:

* ratings
* episode tracking
* episode ratings
* comments
* public profiles
* QR profiles
* taste matching
* creator/critic profiles

identify only CURRENT decisions that may become genuine blockers later.

Do not propose premature abstractions.

## 13. Recommended First Real Loop

Based on the ACTUAL current repository and backlog, recommend one small real product feature that would be an ideal first:

**Builder → Verify → Reviewer → Fix**

experiment.

Do NOT implement the feature.

Explain why it is a good first loop candidate.

---

# Core Principle

We are not trying to make TVLore "look agentic."

We are trying to make development increasingly:

**observable**

**verifiable**

**repeatable**

**reviewable**

**safe to iterate**

while preserving the speed and simplicity that have allowed the project to progress quickly so far.

The best result may be surprisingly small.

If the repository is already well structured and well tested, say so.

Do not add infrastructure merely to demonstrate activity.
