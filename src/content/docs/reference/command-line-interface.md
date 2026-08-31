---
title: Command Line Interface
description: Complete reference for SvelteKit CLI commands and options
---

# Command Line Interface

SvelteKit provides a command-line interface (CLI) for common development tasks. This page documents all available commands and their options.

## Overview

SvelteKit CLI commands are typically run through npm scripts defined in your `package.json`:

~~~json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json"
  }
}
~~~

You can run these commands with:

~~~bash
npm run dev
npm run build
npm run preview
npm run check
~~~

## Commands

### `svelte-kit sync`

Generates TypeScript types for your project. This command is essential for TypeScript support and is automatically run before type checking.

**Usage:**

~~~bash
npx svelte-kit sync
~~~

**What it does:**

- Generates type definitions in `.svelte-kit/types/`
- Creates route parameter types
- Generates load function types
- Creates action types
- Updates `app.d.ts` types

**When to run:**

- After creating new routes
- After modifying route parameters
- Before running type checks
- After pulling changes from version control

**Example workflow:**

~~~bash
# Create a new route
mkdir src/routes/blog/[slug]
echo '<h1>Blog Post</h1>' > src/routes/blog/[slug]/+page.svelte

# Generate types
npx svelte-kit sync

# Now you can use types
cat > src/routes/blog/[slug]/+page.ts << 'EOF'
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  return { slug: params.slug };
};
EOF
~~~

### `vite dev`

Starts the development server with hot module replacement (HMR).

**Usage:**

~~~bash
npm run dev
# or
npx vite dev
~~~

**Options:**

- `--host` — Expose the server to the network
- `--port <port>` — Specify port (default: 5173)
- `--open` — Open browser on startup
- `--strictPort` — Exit if specified port is already in use

**Examples:**

~~~bash
# Start on default port
npm run dev

# Start on port 3000
npx vite dev --port 3000

# Expose to network
npx vite dev --host

# Open browser automatically
npx vite dev --open

# Combine options
npx vite dev --host --port 3000 --open
~~~

**Access the dev server:**

- Local: `http://localhost:5173`
- Network: `http://<your-ip>:5173` (when using `--host`)

**Features:**

- Hot module replacement (HMR)
- Fast refresh on file changes
- Source maps for debugging
- TypeScript support
- Error overlay

### `vite build`

Builds your application for production.

**Usage:**

~~~bash
npm run build
# or
npx vite build
~~~

**Options:**

- `--mode <mode>` — Set environment mode (default: production)
- `--minify` — Enable/disable minification
- `--sourcemap` — Generate source maps

**Examples:**

~~~bash
# Standard build
npm run build

# Build with source maps
npx vite build --sourcemap

# Build in development mode
npx vite build --mode development
~~~

**What it does:**

1. Compiles Svelte components
2. Bundles JavaScript and CSS
3. Optimizes assets
4. Runs the adapter
5. Outputs to `.svelte-kit/output/`

**Build output:**

~~~
.svelte-kit/
└ output/
  ├ client/        # Client-side assets
  ├ server/        # Server-side code
  └ prerendered/   # Prerendered pages (if applicable)
~~~

**Adapter output:**

The adapter transforms the build output for your hosting platform:

- `adapter-node` → `build/` directory
- `adapter-static` → `build/` directory (static files)
- `adapter-vercel` → `.vercel/output/`
- `adapter-netlify` → `netlify/`

### `vite preview`

Previews the production build locally.

**Usage:**

~~~bash
npm run preview
# or
npx vite preview
~~~

**Options:**

- `--host` — Expose the server to the network
- `--port <port>` — Specify port (default: 4173)
- `--open` — Open browser on startup

**Examples:**

~~~bash
# Preview on default port
npm run preview

# Preview on port 3000
npx vite preview --port 3000

# Expose to network
npx vite preview --host
~~~

**Important:**

- You must run `npm run build` first
- This runs the adapter's preview server
- Not suitable for production use (use the adapter's production deployment instead)

**Use cases:**

- Test production build locally
- Debug production issues
- Verify adapter output
- Test before deployment

### `svelte-kit package`

Packages a library for distribution.

**Usage:**

~~~bash
npx svelte-kit package
~~~

**Options:**

- `--dir <dir>` — Output directory (default: `package`)
- `--watch` — Watch for changes and rebuild

**Examples:**

~~~bash
# Package to default directory
npx svelte-kit package

# Package to custom directory
npx svelte-kit package --dir dist

# Watch mode for development
npx svelte-kit package --watch
~~~

**What it does:**

- Processes Svelte components
- Generates TypeScript declarations
- Copies assets
- Creates package.json
- Prepares for npm publishing

**Package structure:**

~~~
package/
├ components/
│ └ Button.svelte
├ utils/
│ └ helpers.js
├ index.js
├ index.d.ts
└ package.json
~~~

**Publishing:**

~~~bash
# Package the library
npx svelte-kit package

# Navigate to package directory
cd package

# Publish to npm
npm publish
~~~

**Note:** This command is for library authors. For applications, use `vite build` instead.

## Package Scripts

Common npm scripts for SvelteKit projects:

### Development

~~~json
{
  "scripts": {
    "dev": "vite dev",
    "dev:host": "vite dev --host",
    "dev:open": "vite dev --open"
  }
}
~~~

### Building

~~~json
{
  "scripts": {
    "build": "vite build",
    "build:sourcemap": "vite build --sourcemap"
  }
}
~~~

### Preview

~~~json
{
  "scripts": {
    "preview": "vite preview",
    "preview:host": "vite preview --host"
  }
}
~~~

### Type Checking

~~~json
{
  "scripts": {
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch"
  }
}
~~~

### Testing

~~~json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
~~~

### Linting and Formatting

~~~json
{
  "scripts": {
    "lint": "prettier --check . && eslint .",
    "format": "prettier --write ."
  }
}
~~~

### Complete Example

~~~json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "lint": "prettier --check . && eslint .",
    "format": "prettier --write ."
  }
}
~~~

## Environment Variables

You can set environment variables when running CLI commands:

### Development

~~~bash
# Set environment variable
PUBLIC_API_URL=https://api.example.com npm run dev

# Use .env file (automatic)
# Create .env file:
# PUBLIC_API_URL=https://api.example.com
npm run dev
~~~

### Build

~~~bash
# Build with specific environment
NODE_ENV=production npm run build

# Build with custom variables
PUBLIC_API_URL=https://api.example.com npm run build
~~~

### Preview

~~~bash
# Preview with custom port
PORT=3000 npm run preview
~~~

## Troubleshooting

### Command Not Found

If you see "command not found" errors:

~~~bash
# Install dependencies
npm install

# Or use npx
npx svelte-kit sync
npx vite dev
~~~

### Port Already in Use

If the default port is in use:

~~~bash
# Use a different port
npm run dev -- --port 3000

# Or kill the process
lsof -ti:5173 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5173    # Windows
~~~

### Types Not Generated

If TypeScript types are missing:

~~~bash
# Run sync manually
npx svelte-kit sync

# Or run check (which runs sync)
npm run check
~~~

### Build Fails

If the build fails:

~~~bash
# Clean build directory
rm -rf .svelte-kit
rm -rf build

# Reinstall dependencies
rm -rf node_modules
npm install

# Try building again
npm run build
~~~

### Preview Shows Blank Page

If preview shows a blank page:

~~~bash
# Make sure you've built first
npm run build

# Check adapter output
ls -la build/  # or .vercel/output/, netlify/, etc.

# Preview again
npm run preview
~~~

## Advanced Usage

### Custom Vite Configuration

You can customize Vite behavior in `vite.config.js`:

~~~js
// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  build: {
    sourcemap: true
  }
});
~~~

### Multiple Environments

Use different `.env` files for different environments:

~~~bash
# .env.development
PUBLIC_API_URL=http://localhost:3000

# .env.production
PUBLIC_API_URL=https://api.example.com

# Build for production
npm run build -- --mode production
~~~

### CI/CD Integration

Example GitHub Actions workflow:

~~~yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - run: npm install
      - run: npm run check
      - run: npm run build

      - name: Deploy
        run: |
          # Your deployment commands here
~~~

## Summary

| Command | Purpose | Common Usage |
|---|---|---|
| `svelte-kit sync` | Generate TypeScript types | Before type checking |
| `vite dev` | Start development server | `npm run dev` |
| `vite build` | Build for production | `npm run build` |
| `vite preview` | Preview production build | `npm run preview` |
| `svelte-kit package` | Package a library | Library authors |

## Next Steps

Learn about TypeScript types in [Types](/reference/types/).
