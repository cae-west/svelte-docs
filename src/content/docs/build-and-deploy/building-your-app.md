---
title: Building Your App
description: Learn how to build your SvelteKit app for production and preview the output
---


So far, everything you've done has run in development mode using `npm run dev`. When you're ready to ship your application to production, you need to build it. This page covers the build process, what gets generated, and how to preview your build locally.

## The Build Command

To create a production build, run:

~~~bash
npm run build
~~~

This command runs `vite build` under the hood, which:

1. Compiles your Svelte components into optimized JavaScript
2. Bundles your code using Vite's build pipeline
3. Generates static assets (CSS, images, fonts)
4. Produces server-side code (if using SSR)
5. Runs your adapter to produce the final output

## The Two-Stage Build

SvelteKit's build process happens in two stages:

### Stage 1: Vite Build

Vite compiles your source code and produces intermediate output in the `.svelte-kit/output/` directory:

~~~
.svelte-kit/output/
├ client/           → Static assets for the browser
│   └ _app/
│       └ immutable/
│           ├── assets/
│           └ chunks/
├ server/           → Server-side JavaScript
│   └ index.js
└ prerendered/      → Prerendered HTML pages
~~~

### Stage 2: Adapter

Your adapter takes the intermediate output and transforms it for your target platform. For example:

- `adapter-node` produces a Node.js server
- `adapter-static` produces static HTML files
- `adapter-vercel` produces Vercel serverless functions

The final output location depends on your adapter.

## Previewing the Build

Before deploying, you should test your production build locally. Run:

~~~bash
npm run preview
~~~

This starts a local server that serves your built app. By default, it runs on `http://localhost:4173`.

The preview server lets you:
- Test your production build before deploying
- Verify that all routes work correctly
- Check that assets load properly
- Test server-side rendering behavior

## Build Output

The exact output depends on your adapter, but a typical build produces:

| Output | Description |
|---|---|
| Client assets | JavaScript, CSS, and static files for the browser |
| Server code | Node.js code for SSR and API routes |
| Prerendered pages | Static HTML for prerendered routes |
| Manifest | A map of routes and their handlers |

## Environment Variables During Build

Your build can access environment variables. SvelteKit exposes these through the `$env` modules:

~~~js
import { env } from '$env/dynamic/private';
import { PUBLIC_API_URL } from '$env/static/public';
~~~

### Build-Time vs Runtime Variables

| Module | When available | Use case |
|---|---|---|
| `$env/static/public` | Build time | Values known at build time (prefixed with `PUBLIC_`) |
| `$env/static/private` | Build time | Secrets known at build time |
| `$env/dynamic/public` | Runtime | Public values that may change |
| `$env/dynamic/private` | Runtime | Secrets that may change |

## Build Configuration

You can customize your build in `svelte.config.js`:

~~~js
import adapter from '@sveltejs/adapter-auto';

export default {
  kit: {
    // Change the output directory
    out: 'build',

    // Configure path aliases
    alias: {
      '$components': 'src/lib/components'
    },

    // Configure the adapter
    adapter: adapter(),

    // Prerendering options
    prerender: {
      entries: ['*'],
      handleHttpError: 'warn'
    }
  }
};
~~~

### Common Configuration Options

| Option | Description |
|---|---|
| `out` | Output directory (default: `build`) |
| `alias` | Path aliases for imports |
| `adapter` | The adapter to use |
| `prerender.entries` | Routes to prerender |
| `prerender.handleHttpError` | How to handle HTTP errors during prerendering |

## Handling Build Errors

Common build errors and how to fix them:

### Missing Adapter

~~~
Error: Could not find adapter
~~~

**Solution:** Install an adapter:

~~~bash
npm install -D @sveltejs/adapter-auto
~~~

### Prerendering Errors

~~~
Error: 404 /missing-page
~~~

**Solution:** Either fix the broken link or configure how to handle HTTP errors:

~~~js
export default {
  kit: {
    prerender: {
      handleHttpError: 'warn' // or 'ignore'
    }
  }
};
~~~

### TypeScript Errors

~~~
Error: Type 'string' is not assignable to type 'number'
~~~

**Solution:** Fix the TypeScript errors in your code. You can also run `npm run check` to see all TypeScript errors without building.

## Build Performance

Tips for faster builds:

- **Use TypeScript sparingly** — Type checking adds time to the build
- **Optimize images** — Large images slow down the build
- **Use code splitting** — SvelteKit does this automatically, but avoid importing large libraries in components that don't need them
- **Enable caching** — Vite caches build artifacts in `node_modules/.vite`

## Continuous Integration

Add a build step to your CI/CD pipeline:

~~~yaml
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: npm run preview &
      - run: npx playwright test
~~~

## Deployment Checklist

Before deploying your app, make sure you've:

- [ ] Chosen and installed the right adapter
- [ ] Tested the build locally with `npm run preview`
- [ ] Set up environment variables for your production environment
- [ ] Configured any custom domains or routing rules
- [ ] Enabled HTTPS in production
- [ ] Set up monitoring and error tracking
- [ ] Run your test suite against the production build

## Next Steps

Now that you understand the build process, learn about the adapter system with [Adapters](/build-and-deploy/adapters/).
