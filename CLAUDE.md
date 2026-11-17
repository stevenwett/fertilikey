# FertiliKey Project Guidelines

## Build Commands
- **Frontend watch**: `cd lib && npm run dev`
- **Production Build**: `npm run build` (webpack into `public/js` and `public/css`)
- **Local Worker**: `npm run dev` (build, then `wrangler dev` with a local D1)
- **Deploy**: `npm run deploy`
- **MySQL dump to D1**: `npm run db:convert -- <dump.sql> --schema-out <file> --data-out <file>` (see `MIGRATION.md`)

## Project Structure
- **Frontend**: React components in `lib/js/components/`
- **Styling**: SCSS in `lib/scss/`
- **Backend**: Cloudflare Worker in `src/index.js` serving `public/` as static assets and `/api/*` from D1 (binding `DB`)
- **Database**: D1 (SQLite) schema in `migrations/`

## Code Style

### JavaScript/React
- Use functional components with hooks
- Follow React best practices for state management
- Handle API errors consistently with try/catch blocks
- Use async/await for asynchronous operations

### CSS/SCSS
- Follow BEM naming convention for classes
- Use Bootstrap mixins and utilities when possible
- Maintain custom variables in `lib/scss/main.scss`
- Mobile-first responsive design

### Worker
- Bind every SQL value with `.bind()`; never build SQL from request data
- Log error details with `console.error`; return generic messages to the client

## Import Conventions
- Group imports by type (React, external libraries, local components)
- Use absolute paths for imports when possible