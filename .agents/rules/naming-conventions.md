# Rule: Coding Standards & Naming Conventions

## Context
Apply these rules to all file creation, refactoring, and code generation tasks. This project follows **StandardJS** for TypeScript and the **Antigravity** (Clean Architecture) pattern.

## 1. File & Folder Naming (Strict PascalCase)
- **Constraint**: Every directory and every file MUST be named using `PascalCase`.
- **Folders**: `UseCases/`, `Domain/`, `Infrastructure/`.
- **Files**: `RegisterUser.ts`, `PostgresUserRepository.ts`.
- **No Kebab-Case**: Convert any `kebab-case` or `snake_case` suggestions to `PascalCase` before writing to disk.

## 2. Naming Conventions (Casing Table)

| Category | Convention | Example |
| :--- | :--- | :--- |
| **Constants** | `UPPER_SNAKE_CASE` | `MAX_RETRY_LIMIT` |
| **Variables/Functions** | `camelCase` | `getUserData()` |
| **Classes/Interfaces/Types** | `PascalCase` | `UserRepository` |
| **API Request/Response** | `snake_case` | `user_id`, `created_at` |

## 3. Architecture Specifics (Antigravity)

### Domain Layer
- **Entities**: Singular nouns (e.g., `User.ts`).
- **Value Objects**: Descriptive attributes (e.g., `Email.ts`).

### Application Layer
- **Use Cases**: Name as **Verb + Noun** (e.g., `UpdateProfile.ts`).
- **Interfaces**: Prefix with `I` (e.g., `IAuthService.ts`).
- **DTOs**: Suffix with `Request` or `Response`.

### Infrastructure Layer
- **Implementations**: `[Technology][Role].ts` (e.g., `S3FileStorage.ts`).
- **Mappers**: Suffix with `Mapper.ts`.

## 4. Syntax & Safety Requirements (StandardJS)
- **Formatting**: 2-space indentation, no semicolons, single quotes.
- **Async**: Always define return types as `Promise<T>`.
- **Logic**: Use explicit null/undefined checks (`val != null`).
- **Mapping**: Map `snake_case` API data to `camelCase` immediately in the Infrastructure/Controller layer.
