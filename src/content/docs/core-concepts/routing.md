---
title: Routing
description: Master SvelteKit's file-based routing system with dynamic routes, layouts, and advanced patterns
---

# Routing

SvelteKit uses a file-based routing system where the structure of your src/routes directory determines your application's routes. Every folder becomes a route segment, and special files like +page.svelte define what renders at that route.

## File-Based Routing

The routing system is simple and predictable:

| File | Route |
|---|---|
| src/routes/+page.svelte | / |
| src/routes/about/+page.svelte | /about |
| src/routes/blog/+page.svelte | /blog |
| src/routes/blog/[slug]/+page.svelte | /blog/my-post |

## Dynamic Routes

To capture values from the URL, wrap folder names in square brackets:

src/routes/products/[id]/+page.svelte

This route matches:
- /products/1
- /products/abc
- /products/my-product-name

Access the parameter in your component:

~~~svelte
<script>
  import { page } from '$app/stores';
</script>

<h1>Product ID: {$page.params.id}</h1>
~~~

### Multiple Parameters

You can have multiple dynamic segments:

src/routes/[category]/[id]/+page.svelte

This matches /electronics/123 and captures both category and id.

### Rest Parameters

To match any number of path segments, use [...rest]:

src/routes/docs/[...path]/+page.svelte

This matches:
- /docs/getting-started
- /docs/api/routing
- /docs/advanced/nested/routes

Access the full path as an array:

~~~js
// For /docs/api/routing
params.path // ['api', 'routing']
~~~

## Layouts

Layouts let you share UI across multiple pages. Create a +layout.svelte file to wrap all pages in that folder and its subfolders:

src/routes/
├ +layout.svelte          → wraps all pages
├ +page.svelte            → /
├ about/
│   └ +page.svelte        → /about
└ blog/
    ├ +layout.svelte      → wraps /blog and /blog/*
    ├ +page.svelte        → /blog
    └ [slug]/
        └ +page.svelte    → /blog/[slug]

A basic layout:

~~~svelte
<script>
  let { children, data } = $props();
</script>

<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/blog">Blog</a>
</nav>

<main>
  {@render children()}
</main>
~~~

The children prop renders the page content. The data prop contains data loaded by +layout.js.

### Layout Reset

To reset the layout (stop inheriting from parent layouts), create a +layout@.svelte file:

src/routes/admin/
├ +layout.svelte          → inherits from root layout
└ +layout@.svelte         → resets to no layout

## Route Groups

Group routes without affecting the URL using (group) folders:

src/routes/
├ (app)/
│   ├ dashboard/+page.svelte   → /dashboard
│   └ settings/+page.svelte    → /settings
└ (marketing)/
    ├ about/+page.svelte       → /about
    └ pricing/+page.svelte     → /pricing

Route groups let you:
- Share layouts within a group
- Organize code by feature
- Apply different configurations to different sections

## Redirects

Redirect users from one route to another using +page.js:

~~~js
// src/routes/old-page/+page.js
import { redirect } from '@sveltejs/kit';

export function load() {
  throw redirect(301, '/new-page');
}
~~~

Common status codes:
- 301 — Permanent redirect (cached)
- 302 — Temporary redirect
- 307 — Temporary redirect (preserves method)
- 308 — Permanent redirect (preserves method)

## Error Pages

Create +error.svelte files to handle errors at any route level:

~~~svelte
<!-- src/routes/blog/[slug]/+error.svelte -->
<script>
  import { page } from '$app/stores';
</script>

<h1>{$page.status}</h1>
<p>{$page.error.message}</p>
~~~

## Route Matching

When multiple routes could match a URL, SvelteKit uses specificity rules:

1. Static routes win over dynamic routes
2. More specific dynamic routes win over less specific ones
3. Rest parameters are least specific

Example:

src/routes/
├ blog/
│   ├ featured/+page.svelte     → /blog/featured (static)
│   ├ [slug]/+page.svelte       → /blog/[slug] (dynamic)
│   └ [...path]/+page.svelte    → /blog/[...path] (rest)

For /blog/featured, the static route wins.
For /blog/my-post, the dynamic route wins.
For /blog/2024/01/my-post, the rest parameter wins.

## Param Matchers

Validate dynamic route parameters with matchers in src/params/:

~~~js
// src/params/integer.js
export function match(value) {
  return /^\d+$/.test(value);
}
~~~

Use the matcher in your route:

src/routes/products/[id=integer]/+page.svelte

Now /products/123 matches, but /products/abc doesn't.

## Page Files

Each route can have multiple special files:

| File | Purpose |
|---|---|
| +page.svelte | The page component |
| +page.js | Load data, configure options |
| +page.server.js | Server-only load, form actions |
| +layout.svelte | Shared layout component |
| +layout.js | Load data for layout |
| +layout.server.js | Server-only layout data |
| +error.svelte | Error page |

## Advanced Patterns

### Optional Parameters

Make a parameter optional with [[optional]]:

src/routes/items/[[id]]/+page.svelte

Matches both /items and /items/123.

### Catch-All Routes

Create a catch-all route with [[...rest]]:

src/routes/[[...catchall]]/+page.svelte

Matches any URL, including the root /.

## Summary

| Concept | Syntax | Example |
|---|---|---|
| Static route | folder name | /about |
| Dynamic route | [param] | /products/[id] |
| Rest parameter | [...rest] | /docs/[...path] |
| Optional param | [[optional]] | /items/[[id]] |
| Route group | (group) | (app)/dashboard |
| Layout | +layout.svelte | Shared UI |
| Error page | +error.svelte | Error handling |

## Next Steps

Now that you understand routing, learn how to load data for your pages with Loading Data.
