# hybrid

Client platform hybrid application engineering toolkit and CLI.

## Vision

`hybrid` is intended to provide a reusable engineering foundation for hybrid applications that combine web technologies with native shells. The focus is reducing integration cost while keeping runtime boundaries explicit and maintainable.

## Scope

This repository is intended to cover:

- hybrid app bootstrap and project structure
- bridge contract governance between web and native layers
- local development, debugging, and packaging workflows
- CLI commands, presets, and templates for common hybrid setups
- validation of runtime capabilities and environment assumptions

This repository should not absorb native business code or product-specific bridge logic.

## Planned Shape

The expected product shape is:

- a CLI for initialization, bridge generation, validation, and local workflows
- shared contracts for bridge methods and events
- presets/templates for common hybrid architectures
- plugins or adapters for different shells and environments
- examples showing end-to-end hybrid development flows

## Initial Milestones

1. Define the bridge domain model and capability boundaries.
2. Decide how CLI, contracts, templates, and adapters are separated.
3. Design config and manifest conventions for hybrid targets.
4. Create a minimal demo that validates bridge contracts locally.

## Working Principles

- bridge contracts are first-class artifacts
- web/native boundaries must be explicit
- developer experience should stay simple even when runtime topology is not
- target-specific implementation belongs in adapters and templates
