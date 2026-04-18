---
trigger: always_on
---

# Antigravity & Design Token Rules

You must follow the **Reference Chain Rule**: Token dependencies must only point to the immediate layer below. Tier jumping is strictly prohibited.

## Layer 1: Primitives (The Constants)

**Location**: `tokens/tier-1-primitives` (or `tokens/primitives.json`).

- Must only contain **literal values** (e.g., #hex, px, ms).
- Must **NOT** reference any other tokens or variables.
- Naming must be **abstract and value-based** (e.g., `blue-500`, `spacing-16`).
- Think of these as the "Atomic Constants" of the design system.

## Layer 2: Semantics (The Intent)

**Location**: `tokens/tier-2-semantics` (or `tokens/semantics.json`).

- Must **ONLY** reference Layer 1 (Primitives).
- Communication with raw values is forbidden; you must use the Primitive alias.
- Naming must be **purpose-driven** (e.g., `color-action-primary`, `surface-bg-subtle`).
- This layer defines how a color or value is used without being tied to a specific UI component.

## Layer 3: Components (The Implementation)

**Location**: `tokens/tier-3-components` (or `tokens/components/*.json`).

- Must **ONLY** reference Layer 2 (Semantics).
- Must **NOT** import or reference Layer 1 Primitives directly.
- Naming must be **component-specific** (e.g., `button-primary-bg`, `card-border-radius`).
- This layer protects the component from global changes by ensuring it only cares about the "Intent" defined in Layer 2.

## Anti-Patterns to Avoid (Gravity)

- **Tier Jumping**: DO NOT reference a Layer 1 Primitive (e.g., `$blue-500`) directly inside a Layer 3 Component token.
- **Literal Pollution**: DO NOT use hardcoded hex or pixel values in Layer 2 or Layer 3.
- **Circular Logic**: A token must never reference itself or a token in a higher layer (e.g., a Semantic token referencing a Component token).
- **Ambiguous Naming**: Avoid names like `color-1` or `temp-spacing`. If a value is worth tokenizing, it must follow the tier's naming convention.
