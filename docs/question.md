# Questions (portal-service)

No open questions.

## Frontend

- The brief says `apps/portal` is nearly empty, but it already has ~50 tracked source files: Next.js app routes (login, dashboard, merchants, products, stores, staff, transactions, map-store), a domain/usecases/repositories/infrastructure layer with an axios `ApiClient`, and a styled-components registry. Is this existing code the baseline to keep and refactor, or should it be replaced? I did not rebuild anything until this is answered.
- The existing portal takes its theme from the external package `@apisit110/pos-ui` (`lightTheme`, `darkTheme`, `Theme`, `InputField`, `Button`), and `src/styled.d.ts` extends that `Theme`. Should the 3-tier tokens (primitive, semantic, component) live in this package (pos-ui) or in `apps/portal`? If they live in `apps/portal`, should pos-ui be dropped, wrapped, or kept for its components?
- Token naming is not defined in the docs. Please confirm the names, for example `theme.color.bg.primary`, `theme.color.text.success`, `theme.component.button.primaryBg`, and the primitive scales (colors, spacing, font sizes, radii, shadows). Please also supply the palette, the typography scale (the current font is Prompt) and the spacing scale.
- Should the portal support both light and dark themes? The registry currently supports both and defaults to dark. What should the default be, and should the choice be persisted?
- `globals.css` holds hardcoded colors and global `input`/`button` styles, and several pages use inline styles with raw hex values (`#6366f1`, `#f87171` and others). The registry also builds the `ServerStyleSheet` in `useState` and does not use the Next.js `StyleSheetManager` recommended pattern. May I remove these once the token source is decided?
- No layouts or wireframes exist for any page (list columns, filters, forms, detail views, the store-product batch add flow, empty and error states). Please provide a design spec or confirm that the existing pages are the intended UX.
- The docs define the auth tokens (access and refresh JWT) but not how the portal stores them. The current code assumes cookies (`withCredentials`) and a `/auth/me` endpoint. Is that right? Should the portal refresh the token automatically on 401, and where should it redirect (the current code redirects `/` to `/login`)? Is route guarding by UAM permission needed, such as hiding menu items per permission?
- UAM has only the "Product Owner" role. Should the UI do any permission-based hiding (for example `merchants:create`), or is it all-or-nothing for now?
- Dashboard (`dashboard:view`), members (`members:view`) and terminal create (`terminals:create`) appear in UAM but have no API flow doc. Should I build pages for them? What should they show?
- Lint currently fails with 11 errors (for example `no-explicit-any` in catch blocks, `react-hooks/set-state-in-effect` in `products/page.tsx`, and an empty interface in `styled.d.ts`). May I fix these as part of a refactor?

## Backend

- `docs/logging/Request.md`, `Response.md` and `ResponseError.md` are empty. The current `LoggerMiddleware` logs `request` / `response` / `error` JSON with `request_id`, `correlation_id`, masked headers/body. What fields and format must the logs follow? Skipped, left as is.
- `pin-repository.md` rule 5 asks for the top 1000 weak PINs from a public dataset; `WEAK_PINS` in `domain/constants/pin.ts` has about 90 entries (marked TODO). Which dataset should be used?
- `apps/pos-sync-service`: no flow docs exist; only `docs/openapi-center.yaml`. That contract uses camelCase bodies and no `res_code` envelope, which conflicts with the global rules (snake_case external, `Ok` / error envelope, `Accept-Language`). Should the sync endpoints move to the snake_case + `res_code` envelope, or keep the openapi contract (pos clients already depend on it)? Also `/v1/sync/users` is in the openapi but not implemented, and `/v1/sync/products/receive` is implemented but not in the openapi. Skipped, pos-sync-service left unchanged.
