# Skill: Create New Use Case

When asked to create a new feature/use case, follow this pattern:

1. **Define the Interface:** Create a repository interface in `src/application/interfaces/`.
2. **Implement Logic:** Create the class in `src/application/use-cases/[Name].ts`.
3. **Dependency Injection:** Use constructor injection for all dependencies.

**Template:**
export class {{UseCaseName}} {
constructor(private readonly {{RepoName}}: I{{RepoName}}) {}

async execute(request: {{RequestType}}): Promise<{{ResponseType}}> {
// 1. Fetch from repo
// 2. Apply Domain Rules
// 3. Persist changes
// 4. Return result
}
}
