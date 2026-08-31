---
title: Migrating to SvelteKit v2
description: Step-by-step guide for upgrading from SvelteKit v1 to v2 with breaking changes and migration strategies
---


SvelteKit v2 is a major release that includes breaking changes. This guide walks you through the migration process, covering all the changes you need to make to upgrade your application.

## Overview of Changes

SvelteKit v2 includes:

- **Svelte 5 requirement** — SvelteKit v2 requires Svelte 5
- **Node.js 18.13+** — Minimum Node.js version increased
- **Cookies API changes** — New cookie handling
- **Fetch API changes** — Updated fetch behavior
- **Type changes** — Updated TypeScript types
- **Configuration changes** — Updated configuration options
- **Removed deprecated features** — Cleanup of old APIs

## Prerequisites

Before migrating:

1. **Update Node.js** to version 18.13 or later:

~~~bash
node --version  # Should be 18.13+
~~~

2. **Update package.json** to use SvelteKit v2:

~~~json
{
  "devDependencies": {
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/adapter-auto": "^3.0.0",
    "@sveltejs/adapter-node": "^2.0.0",
    "svelte": "^5.0.0",
    "vite": "^5.0.0"
  }
}
~~~

3. **Install dependencies**:

~~~bash
npm install
~~~

## Svelte 5 Migration

SvelteKit v2 requires Svelte 5, which introduces runes and other changes.

### Runes Migration

Svelte 5 replaces reactive declarations with runes:

**Before (Svelte 4):**

~~~svelte
<script>
  let count = 0;
  $: doubled = count * 2;

  function increment() {
    count += 1;
  }
</script>

<button on:click={increment}>
  Count: {count}, Doubled: {doubled}
</button>
~~~

**After (Svelte 5):**

~~~svelte
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);

  function increment() {
    count += 1;
  }
</script>

<button onclick={increment}>
  Count: {count}, Doubled: {doubled}
</button>
~~~

### Props Migration

**Before:**

~~~svelte
<script>
  export let name;
  export let age = 0;
</script>
~~~

**After:**

~~~svelte
<script>
  let { name, age = 0 } = $props();
</script>
~~~

### Event Handler Migration

**Before:**

~~~svelte
<button on:click={handleClick}>Click me</button>
<input on:input={handleInput} />
~~~

**After:**

~~~svelte
<button onclick={handleClick}>Click me</button>
<input oninput={handleInput} />
~~~

### Slots Migration

**Before:**

~~~svelte
<!-- Parent -->
<Child>
  <span slot="header">Header</span>
  <p>Default content</p>
</Child>

<!-- Child -->
<slot name="header" />
<slot />
~~~

**After:**

~~~svelte
<!-- Parent -->
<Child>
  {#snippet header()}
    <span>Header</span>
  {/snippet}
  <p>Default content</p>
</Child>

<!-- Child -->
<script>
  let { header, children } = $props();
</script>

{@render header()}
{@render children()}
~~~

## Cookies API Changes

The cookies API has been updated for better type safety and clarity.

### Setting Cookies

**Before:**

~~~js
export async function load({ cookies }) {
  cookies.set('session', 'abc123', {
    path: '/',
    httpOnly: true
  });
}
~~~

**After:**

~~~js
export async function load({ cookies }) {
  cookies.set('session', 'abc123', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 60 * 60 * 24 // 1 day
  });
}
~~~

The main change is that `secure` and `sameSite` are now required for production.

### Deleting Cookies

**Before:**

~~~js
cookies.delete('session');
~~~

**After:**

~~~js
cookies.delete('session', { path: '/' });
~~~

You must now specify the `path` when deleting cookies.

## Fetch API Changes

### Relative URLs

**Before:**

~~~js
export async function load({ fetch }) {
  const response = await fetch('/api/data');
}
~~~

**After:**

~~~js
export async function load({ fetch, url }) {
  const response = await fetch('/api/data');
  // or
  const response = await fetch(new URL('/api/data', url));
}
~~~

Relative URLs now work differently. Use absolute paths or construct URLs explicitly.

### External URLs

**Before:**

~~~js
export async function load({ fetch }) {
  const response = await fetch('https://api.example.com/data');
}
~~~

**After:**

~~~js
export async function load({ fetch }) {
  const response = await fetch('https://api.example.com/data', {
    credentials: 'include' // if needed
  });
}
~~~

External URLs now require explicit credential handling.

## Type Changes

### Load Function Types

**Before:**

~~~ts
import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ params }) => {
  return { post: await getPost(params.slug) };
};
~~~

**After:**

~~~ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  return { post: await getPost(params.slug) };
};
~~~

Use generated types from `./$types` instead of importing from `@sveltejs/kit`.

### Action Types

**Before:**

~~~ts
import type { Action } from '@sveltejs/kit';

export const POST: Action = async ({ request }) => {
  const data = await request.formData();
  return { success: true };
};
~~~

**After:**

~~~ts
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    return { success: true };
  }
};
~~~

### Event Types

**Before:**

~~~ts
import type { RequestEvent } from '@sveltejs/kit';

export async function GET(event: RequestEvent) {
  return new Response('ok');
}
~~~

**After:**

~~~ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  return new Response('ok');
};
~~~

## Configuration Changes

### svelte.config.js

**Before:**

~~~js
import adapter from '@sveltejs/adapter-auto';

export default {
  kit: {
    adapter: adapter(),
    files: {
      assets: 'static'
    }
  }
};
~~~

**After:**

~~~js
import adapter from '@sveltejs/adapter-auto';

export default {
  kit: {
    adapter: adapter()
  }
};
~~~

The `files.assets` option has been removed. Static files are now always in the `static` directory.

### Vite Configuration

**Before:**

~~~js
import { sveltekit } from '@sveltejs/kit/vite';

export default {
  plugins: [sveltekit()]
};
~~~

**After:**

~~~js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()]
});
~~~

Use `defineConfig` for better type support.

## Removed Features

### `preload` Option

The `preload` option in `app.html` has been removed. Use link options instead:

**Before:**

~~~html
<body data-sveltekit-preload>
  %sveltekit.body%
</body>
~~~

**After:**

~~~html
<body data-sveltekit-preload-data="hover">
  %sveltekit.body%
</body>
~~~

### `trailingSlash` Option

The `trailingSlash` option has been moved:

**Before:**

~~~js
// src/routes/+layout.js
export const trailingSlash = 'always';
~~~

**After:**

~~~js
// src/routes/+layout.js
export const trailingSlash = 'always';
~~~

This still works, but the behavior has changed slightly. Test your routes after migration.

### `prerender` Default

The default value for `prerender` has changed from `true` to `false` for new projects. If you want to prerender, set it explicitly:

~~~js
// src/routes/+layout.js
export const prerender = true;
~~~

## Step-by-Step Migration

### Step 1: Update Dependencies

Update your `package.json`:

~~~json
{
  "devDependencies": {
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/adapter-auto": "^3.0.0",
    "svelte": "^5.0.0",
    "vite": "^5.0.0"
  }
}
~~~

Run:

~~~bash
npm install
~~~

### Step 2: Migrate to Svelte 5

Update your components to use runes:

- Replace `export let` with `$props()`
- Replace `$:` with `$derived()`
- Replace `let` with `$state()` for reactive variables
- Replace `on:click` with `onclick`
- Replace `<slot>` with snippets

### Step 3: Update Types

Replace imported types with generated types:

- `Load` → `PageLoad` from `./$types`
- `Action` → `Actions` from `./$types`
- `RequestEvent` → `RequestHandler` from `./$types`

### Step 4: Update Cookies

Add required options to `cookies.set()` and `cookies.delete()`:

~~~js
cookies.set('name', 'value', {
  path: '/',
  secure: true,
  sameSite: 'lax'
});

cookies.delete('name', { path: '/' });
~~~

### Step 5: Update Fetch Calls

Review all `fetch` calls and update relative URLs:

~~~js
// Before
await fetch('/api/data');

// After
await fetch('/api/data');
// or
await fetch(new URL('/api/data', url));
~~~

### Step 6: Test Thoroughly

Test all routes, forms, and API endpoints. Pay special attention to:
- Cookie handling
- Form submissions
- Data loading
- Client-side navigation
- Server-side rendering

### Step 7: Fix TypeScript Errors

Run the type checker:

~~~bash
npm run check
~~~

Fix any TypeScript errors that appear.

## Common Issues

### "Cannot find module './$types'"

This happens when types haven't been generated. Run:

~~~bash
npm run dev
~~~

Or:

~~~bash
npm run build
~~~

This generates the types in `.svelte-kit/types/`.

### "Property 'X' does not exist on type 'Y'"

This usually means you're using old types. Update to use generated types from `./$types`.

### "cookies.set requires secure option"

Add the `secure` option:

~~~js
cookies.set('name', 'value', {
  path: '/',
  secure: process.env.NODE_ENV === 'production'
});
~~~

### "Slot 'X' is not defined"

You're using the old slot syntax. Migrate to snippets:

**Before:**

~~~svelte
<Child>
  <span slot="header">Header</span>
</Child>
~~~

**After:**

~~~svelte
<Child>
  {#snippet header()}
    <span>Header</span>
  {/snippet}
</Child>
~~~

### "on:click is deprecated"

Update event handlers:

**Before:**

~~~svelte
<button on:click={handleClick}>Click</button>
~~~

**After:**

~~~svelte
<button onclick={handleClick}>Click</button>
~~~

## Migration Checklist

- [ ] Update Node.js to 18.13+
- [ ] Update `@sveltejs/kit` to v2
- [ ] Update `svelte` to v5
- [ ] Update adapter to latest version
- [ ] Migrate components to Svelte 5 runes
- [ ] Update event handlers (`on:click` → `onclick`)
- [ ] Migrate slots to snippets
- [ ] Update types to use `./$types`
- [ ] Update cookies API usage
- [ ] Update fetch calls
- [ ] Remove deprecated configuration options
- [ ] Run `npm run check` and fix errors
- [ ] Test all routes and functionality
- [ ] Test forms and data loading
- [ ] Test client-side navigation
- [ ] Test server-side rendering
- [ ] Deploy to staging and test

## Rollback Plan

If you encounter critical issues, you can rollback:

1. Revert `package.json` to v1 versions
2. Run `npm install`
3. Revert code changes (use Git)
4. Test to ensure v1 still works

## Additional Resources

- [SvelteKit v2 Release Notes](https://github.com/sveltejs/kit/blob/main/packages/kit/CHANGELOG.md)
- [Svelte 5 Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide)
- [SvelteKit Discord](https://svelte.dev/chat)

## Summary

| Change | Impact | Effort |
|---|---|---|
| Svelte 5 requirement | High | Medium |
| Runes migration | High | Medium |
| Cookies API | Medium | Low |
| Type changes | Medium | Low |
| Fetch changes | Low | Low |
| Config changes | Low | Low |

## Next Steps

See Additional Resources in [Additional Resources](/appendix/additional-resources/).
