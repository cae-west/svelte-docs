---
title: Advanced Routing
description: Master advanced routing techniques including rest parameters, optional parameters, matchers, route groups, and layout control
---

# Advanced Routing

SvelteKit's filesystem-based routing is simple to start with, but powerful enough for complex applications. This page covers advanced routing features that let you handle dynamic URLs, validate parameters, organize routes with groups, and control layout inheritance.

## Rest Parameters

To match an unknown number of path segments, use a rest parameter `[...rest]`, named for its resemblance to rest parameters in JavaScript:

~~~
src/routes/[...path]/+page.svelte
~~~

This route matches any path:
- `/foo` → `params.path = 'foo'`
- `/foo/bar` → `params.path = 'foo/bar'`
- `/foo/bar/baz` → `params.path = 'foo/bar/baz'`

### Catch-All Routes

Rest parameters are useful as catch-all routes for custom 404 pages:

~~~
src/routes/
├ +page.svelte          → /
├ [...path]/
│   └ +page.svelte      → /* (catch-all)
~~~

More specific routes are tested first, so `/about` will match a dedicated `about/+page.svelte` before falling through to the catch-all.

### Using Rest Parameters

Access the rest parameter in your component:

~~~svelte
<!-- src/routes/[...path]/+page.svelte -->
<script>
  let { data } = $props();
</script>

<p>Path: {data.path}</p>
~~~

~~~js
// src/routes/[...path]/+page.js
export function load({ params }) {
  return {
    path: params.path
  };
}
~~~

## Optional Parameters

Sometimes you want a parameter to be optional. For example, a route like `[lang]/home` requires a language parameter, but you might want `home` and `en/home` to point to the same page.

Wrap the parameter in double brackets to make it optional:

~~~
src/routes/[[lang]]/home/+page.svelte
~~~

Now both routes work:
- `/home` → `params.lang = undefined`
- `/en/home` → `params.lang = 'en'`

### Handling Optional Parameters

Check if the parameter exists:

~~~svelte
<script>
  let { data } = $props();
</script>

{#if data.lang}
  <p>Language: {data.lang}</p>
{:else}
  <p>Default language</p>
{/if}
~~~

~~~js
export function load({ params }) {
  return {
    lang: params.lang || 'en'
  };
}
~~~

### Combining Optional and Rest Parameters

An optional parameter cannot follow a rest parameter (`[...rest]/[[optional]]`), since parameters are matched greedily and the optional parameter would always be unused.

## Param Matchers

You can ensure route parameters are well-formed by adding a **matcher** — a function that takes the parameter string and returns `true` if it's valid.

### Creating a Matcher

Create a file in `src/params/`:

~~~js
// src/params/hex.js
export function match(value) {
  return /^[0-9a-f]{6}$/.test(value);
}
~~~

### Using a Matcher

Append `=matcher` to the parameter name:

~~~
src/routes/colors/[color=hex]/+page.svelte
~~~

Now SvelteKit validates the parameter:
- `/colors/ff0000` → matches (valid hex)
- `/colors/rocketship` → doesn't match, tries other routes

Matchers run both on the server and in the browser.

### Multiple Matchers

You can create multiple matchers for different validation rules:

~~~js
// src/params/integer.js
export function match(value) {
  return /^\d+$/.test(value);
}
~~~

~~~js
// src/params/slug.js
export function match(value) {
  return /^[a-z0-9-]+$/.test(value);
}
~~~

Use them in routes:

~~~
src/routes/blog/[id=integer]/+page.svelte
src/routes/docs/[slug=slug]/+page.svelte
~~~

## Route Groups

Sometimes you want to use layouts without affecting the route path. **Route groups** let you organize routes with shared layouts using directories in parentheses.

### Creating a Route Group

Create a directory with parentheses:

~~~
src/routes/
├ (app)/
│   ├ +layout.svelte    → Shared layout for /app and /dashboard
│   ├ app/
│   │   └ +page.svelte  → /app
│   └ dashboard/
│       └ +page.svelte  → /dashboard
├ (marketing)/
│   ├ +layout.svelte    → Shared layout for /about and /pricing
│   ├ about/
│   │   └ +page.svelte  → /about
│   └ pricing/
│       └ +page.svelte  → /pricing
~~~

The `(app)` and `(marketing)` directories don't appear in the URL.

### Use Cases

Route groups are useful for:

**Authentication:**
~~~
src/routes/
├ (authed)/
│   ├ +layout.server.js → Check authentication
│   ├ profile/
│   └ settings/
├ (public)/
│   ├ about/
│   └ pricing/
~~~

**Different layouts:**
~~~
src/routes/
├ (admin)/
│   ├ +layout.svelte    → Admin sidebar layout
│   └ dashboard/
├ (shop)/
│   ├ +layout.svelte    → Shop header layout
│   └ products/
~~~

### Route Group Rules

- Route groups can contain any routes
- Multiple route groups can have overlapping paths (if matchers disambiguate)
- Route groups don't affect the URL path

## Breaking Out of Layouts

By default, layouts nest. A route inherits all parent layouts. Sometimes you need to break this inheritance.

### Resetting Layouts

Use `+layout.svelte` with a slot to reset the layout:

~~~svelte
<!-- src/routes/special/+layout.svelte -->
<slot />
~~~

This creates a new layout context, breaking inheritance from parent layouts.

### Example

~~~
src/routes/
├ +layout.svelte        → Root layout (header, footer)
├ +layout.svelte
├ about/
│   └ +page.svelte      → Inherits root layout
├ special/
│   ├ +layout.svelte    → Resets layout (no header/footer)
│   └ +page.svelte      → Uses special layout only
~~~

## Route Sorting

When multiple routes match a path, SvelteKit uses a sorting algorithm to determine which route wins:

1. **Static segments** win over dynamic segments
2. **More specific** routes win over less specific
3. **Matchers** can disambiguate

### Examples

~~~
/about          → matches /about (static wins)
/blog/[slug]    → matches /blog/hello (dynamic)
/blog/[...rest] → matches /blog/a/b/c (rest is least specific)
~~~

### Disambiguating with Matchers

When two routes could match the same path, use matchers:

~~~
src/routes/
├ [id=integer]/
│   └ +page.svelte    → /123
├ [slug=slug]/
│   └ +page.svelte    → /hello-world
~~~

## 404 Pages

Create a custom 404 page using the `+error.svelte` component:

~~~svelte
<!-- src/routes/+error.svelte -->
<script>
  import { page } from '$app/stores';
</script>

<h1>{$page.status}</h1>
<p>{$page.error.message}</p>
~~~

This error component applies to all routes. For route-specific error pages, create `+error.svelte` in the route directory.

## Dynamic Route Resolution

SvelteKit resolves routes at build time when possible, but some routes are dynamic. You can control route resolution with the `reroute` hook:

~~~js
// src/hooks.js
export function reroute({ url }) {
  if (url.pathname === '/old-page') {
    return '/new-page';
  }
}
~~~

This lets you redirect URLs without changing the file structure.

## Summary

| Feature | Syntax | Use Case |
|---|---|---|
| Rest parameter | `[...path]` | Match any number of segments |
| Optional parameter | `[[lang]]` | Make a parameter optional |
| Param matcher | `[color=hex]` | Validate parameter format |
| Route group | `(group)/` | Share layouts without affecting URL |
| Layout reset | `+layout.svelte` with `<slot />` | Break layout inheritance |

## Next Steps

Learn how to hook into the request lifecycle with [Hooks](/advanced/hooks/).
