---
trigger: always_on
---

# Antigravity & Clean Architecture Rules

You must follow the Dependency Rule: Source code dependencies can only point inwards.

## Layer 1: Entities (The Rules)

- Located in `src/domain/entities`.
- Must NOT import anything from outside the domain layer.
- No framework decorators (e.g., TypeORM, Sequelize).
- Must contain core business logic, not just data.

## Layer 2: Use Cases (The Skills)

- Located in `src/application/use-cases`.
- Must depend only on Entities.
- Communication with external worlds (DB, API) MUST happen via Interfaces defined in this layer.
- Use Case classes should only have ONE public method: `execute()`.

## Anti-Patterns to Avoid (Gravity)

- DO NOT import `infrastructure` or `controllers` into `application` or `domain`.
- DO NOT use concrete database classes inside Use Cases.
