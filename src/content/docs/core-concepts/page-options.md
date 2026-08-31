---
title: Page Options
description: Configure SSR, prerendering, and other page-level settings in SvelteKit
---

# Page Options

SvelteKit lets you configure how each page behaves — whether it renders on the server, prerenders to static HTML, or runs only in the browser. These options are set using `export const` in your `+page.js` or `+layout.js` files.

## SSR Option

By default, SvelteKit renders pages on the server (SSR). You can disable it for specific pages:

~~~js
// src/routes/some-page/+page.js
export const ssr = false;
~~~

When `ssr` is `false`, the page renders only in the browser. This is useful for:

- Pages that depend on browser-only APIs (like `window` or `localStorage`)
- Reducing server load for non-critical pages
- Single-page application (SPA) mode

### Disabling SSR Globally

To disable SSR for your entire app, set it in the root layout:

~~~js
// src/routes/+layout.js
export const ssr = false;
~~~

## Prerender Option

Prerendering generates static HTML at build time. This is ideal for content that doesn't change between users:

~~~js
// src/routes/about/+page.js
export const prerender = true;
~~~

### Prerendering Dynamic Routes

For dynamic routes, you need to specify which pages to prerender using the `entries` function:

~~~js
// src/routes/blog/[slug]/+page.js
export const prerender = true;

export function entries() {
  return [
    { slug: 'first-post' },
    { slug: 'second-post' }
  ];
}
~~~

### Prerendering the Entire Site

To prerender your entire site (useful for static hosting like GitHub Pages):

~~~js
// src/routes/+layout.js
export const prerender = true;
~~~

## CSR Option

CSR (Client-Side Rendering) controls whether SvelteKit hydrates the page with JavaScript after it loads:

~~~js
// src/routes/some-page/+page.js
export const csr = false;
~~~

When `csr` is `false`, the page is static HTML with no interactivity. This is useful for:

- Content-heavy pages that don't need JavaScript
- Improving performance for simple pages
- Reducing bundle size

## Trailing Slashes

Control how trailing slashes are handled in URLs:

~~~js
// src/routes/some-page/+page.js
export const trailingSlash = 'always';
~~~

| Value | Behavior | Example |
|---|---|---|
| `'never'` | No trailing slash (default) | `/about` |
| `'always'` | Always add trailing slash | `/about/` |
| `'ignore'` | Both work | `/about` and `/about/` |

## Combining Options

You can combine multiple options in a single file:

~~~js
// src/routes/docs/+page.js
export const prerender = true;
export const trailingSlash = 'always';
~~~

## Option Scope

Options can be set at different levels:

### Page Level

Applies only to that specific page:

~~~js
// src/routes/blog/+page.js
export const prerender = true;
~~~

### Layout Level

Applies to the layout and all pages inside it:

~~~js
// src/routes/+layout.js
export const ssr = false; // applies to all pages
~~~

### App Level

Configure defaults in `svelte.config.js`:

~~~js
export default {
  kit: {
    prerender: {
      entries: ['*']
    }
  }
};
~~~

## When to Use What

| Scenario | Recommended Options |
|---|---|
| Blog post | `prerender = true` |
| User dashboard | `ssr = true` (default) |
| Admin panel | `ssr = false` |
| Static documentation | `prerender = true` |
| Marketing page | `prerender = true`, `csr = false` |

## Performance Considerations

- **SSR** — Better for SEO and initial load, but uses server resources
- **Prerender** — Fastest performance, but content is static at build time
- **CSR only** — Simpler deployment, but slower initial load and worse SEO

## Summary

| Option | Default | Purpose |
|---|---|---|
| `ssr` | `true` | Server-side rendering |
| `prerender` | `false` | Static HTML at build time |
| `csr` | `true` | Client-side hydration |
| `trailingSlash` | `'never'` | URL trailing slash behavior |

## Next Steps

Learn how to share data across components with [State Management](/core-concepts/state-management/).
