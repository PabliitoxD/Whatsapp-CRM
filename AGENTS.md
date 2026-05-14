<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Build and Code Integrity Rules

1. **Mandatory Import Check**: Always verify that all components, icons (lucide-react), and hooks are properly imported before finalizing any file change. Missing imports are the primary cause of build failures.
2. **Pre-Commit Build Validation**: After making significant changes or adding new UI components, always run `npm run build` locally to ensure the project compiles successfully.
3. **TypeScript Strictness**: Do not ignore type errors. If a type is unknown or missing, define it properly in `src/lib/types.ts` or locally.
4. **Client-Side Safety**: When using `window` or `document` in 'use client' components, ensure they are accessed within `useEffect` or event handlers to avoid issues during static site generation (SSG).
