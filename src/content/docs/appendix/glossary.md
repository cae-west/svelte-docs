---
title: Glossary
description: A comprehensive glossary of SvelteKit terminology, concepts, and technical terms
---


This glossary defines key terms and concepts used throughout SvelteKit. Use it as a reference when you encounter unfamiliar terminology in the documentation or codebase.

## A

### Adapter

A plugin that transforms your built SvelteKit app into the format required by your hosting platform. Adapters handle server-side rendering, static file serving, and platform-specific optimizations.

**Examples:** `@sveltejs/adapter-node`, `@sveltejs/adapter-vercel`, `@sveltejs/adapter-static`

**See also:** [Adapters](/build-and-deploy/adapters/)

### App Directory

The `src/` directory in a SvelteKit project that contains your application code, including routes, components, libraries, and configuration files.

### Assets

Static files (images, fonts, icons) that are served directly without processing. In SvelteKit, assets are typically stored in the `static/` directory.

## B

### Base Path

A URL prefix applied to all routes in your application. Useful when deploying to a subdirectory.

**Configuration:**

~~~js
// svelte.config.js
export default {
  kit: {
    paths: {
      base: '/my-app'
    }
  }
};
~~~

### Build

The process of compiling your SvelteKit application into optimized production code. The build output is stored in the `.svelte-kit/` directory.

**Command:**

~~~bash
npm run build
~~~

## C

### Catch-all Route

A route that matches any URL path using rest parameters. Denoted by `[...param]` in the directory name.

**Example:**

~~~
src/routes/[...path]/+page.svelte
~~~

Matches `/foo`, `/foo/bar`, `/foo/bar/baz`.

**See also:** [Advanced Routing](/advanced/advanced-routing/)

### Client-side Rendering (CSR)

Rendering pages in the browser using JavaScript. After the initial server-side render, subsequent navigation is handled client-side for faster transitions.

**Configuration:**

~~~js
// src/routes/+layout.js
export const csr = true;
~~~

**See also:** [Page Options](/core-concepts/page-options/)

### Component

A reusable piece of UI written in Svelte. Components have a `.svelte` file extension and contain HTML, CSS, and JavaScript.

**Example:**

~~~svelte
<!-- src/lib/Button.svelte -->
<script>
  let { label = 'Click me' } = $props();
</script>

<button>{label}</button>
~~~

### Cookies

Small pieces of data stored in the browser. SvelteKit provides a `cookies` API for reading and writing cookies in server-side code.

**Usage:**

~~~js
export async function load({ cookies }) {
  const session = cookies.get('session');
  cookies.set('theme', 'dark', { path: '/' });
}
~~~

### Cross-Site Request Forgery (CSRF)

A security attack where unauthorized commands are submitted from a user the web application trusts. SvelteKit includes CSRF protection by default.

## D

### Data Loading

The process of fetching data for a page before it renders. SvelteKit provides `load` functions for this purpose.

**Example:**

~~~js
// src/routes/posts/+page.js
export async function load({ fetch }) {
  const response = await fetch('/api/posts');
  return { posts: await response.json() };
}
~~~

**See also:** [Loading Data](/core-concepts/loading-data/)

### Dynamic Route

A route that includes parameters in the URL, allowing it to match multiple paths. Denoted by square brackets in the directory name.

**Example:**

~~~
src/routes/blog/[slug]/+page.svelte
~~~

Matches `/blog/hello-world`, `/blog/my-post`, etc.

**See also:** [Routing](/core-concepts/routing/)

## E

### Endpoint

A server-side route that returns data instead of rendering a page. Defined with `+server.js` files.

**Example:**

~~~js
// src/routes/api/posts/+server.js
export async function GET({ url }) {
  const posts = await getPosts();
  return new Response(JSON.stringify(posts), {
    headers: { 'Content-Type': 'application/json' }
  });
}
~~~

### Environment Variables

Configuration values stored outside your code, typically in `.env` files or your hosting platform's dashboard. SvelteKit provides `$env` modules for accessing them.

**Usage:**

~~~js
import { PUBLIC_API_URL } from '$env/static/public';
import { DATABASE_URL } from '$env/static/private';
~~~

## F

### Fallthrough

When a load function returns without data, allowing the next matching route to handle the request. Removed in SvelteKit v2.

### Form Action

A server-side function that handles form submissions. Defined in `+page.server.js` files.

**Example:**

~~~js
// src/routes/login/+page.server.js
export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email');
    // Process form data
    return { success: true };
  }
};
~~~

**See also:** [Form Actions](/core-concepts/form-actions/)

## H

### Handle

A server-side hook that runs on every request. Used for authentication, logging, and request modification.

**Example:**

~~~js
// src/hooks.server.js
export async function handle({ event, resolve }) {
  event.locals.user = await getUser(event.cookies.get('session'));
  return await resolve(event);
}
~~~

**See also:** [Hooks](/advanced/hooks/)

### Hooks

Functions that run at specific points in the request lifecycle. SvelteKit provides `handle`, `handleError`, and `reroute` hooks.

**See also:** [Hooks](/advanced/hooks/)

## I

### Invalidate

A function that triggers a refetch of data for a specific URL or all URLs.

**Usage:**

~~~js
import { invalidate } from '$app/navigation';

await invalidate('/api/posts');
~~~

## L

### Layout

A component that wraps multiple pages, providing shared UI like headers, footers, and navigation. Defined with `+layout.svelte` files.

**Example:**

~~~svelte
<!-- src/routes/+layout.svelte -->
<script>
  let { children } = $props();
</script>

<header>Site Header</header>
<main>{@render children()}</main>
<footer>Site Footer</footer>
~~~

### Layout Reset

A special layout file that resets the layout hierarchy, preventing child routes from inheriting parent layouts.

**Example:**

~~~
src/routes/
├ +layout.svelte
├ admin/
│ ├ +layout.svelte
│ └ +page@.svelte  <!-- Uses root layout, not admin layout -->
~~~

### Locals

Request-scoped data that persists throughout the request lifecycle. Set in hooks and accessed in load functions and endpoints.

**Usage:**

~~~js
// In hooks.server.js
event.locals.user = await getUser(session);

// In load function
export function load({ locals }) {
  return { user: locals.user };
}
~~~

## M

### Module

A JavaScript file that exports functions, variables, or components. SvelteKit uses ES modules throughout.

## N

### Navigation

The process of moving between pages in your application. SvelteKit provides navigation functions and link options.

**Functions:**

- `goto(url)` — Navigate programmatically
- `invalidate(url)` — Refetch data
- `beforeNavigate(callback)` — Intercept navigation

## O

### Optional Parameter

A route parameter that may or may not be present in the URL. Denoted by double square brackets.

**Example:**

~~~
src/routes/[[lang]]/home/+page.svelte
~~~

Matches both `/home` and `/en/home`.

**See also:** [Advanced Routing](/advanced/advanced-routing/)

## P

### Page

A route that renders a UI component. Defined with `+page.svelte` files.

**Example:**

~~~svelte
<!-- src/routes/+page.svelte -->
<script>
  let { data } = $props();
</script>

<h1>Welcome to {data.title}</h1>
~~~

### Page Options

Configuration options that control how a page behaves. Set in `+page.js` files.

**Options:**

- `prerender` — Generate static HTML at build time
- `ssr` — Enable server-side rendering
- `csr` — Enable client-side rendering
- `trailingSlash` — Control trailing slashes in URLs

**See also:** [Page Options](/core-concepts/page-options/)

### Prerender

The process of generating static HTML at build time instead of runtime. Improves performance and SEO.

**Configuration:**

~~~js
// src/routes/+layout.js
export const prerender = true;
~~~

**See also:** [Static Site Generation](/build-and-deploy/static-site-generation/)

## R

### Redirect

A function that navigates the user to a different URL.

**Usage:**

~~~js
import { redirect } from '@sveltejs/kit';

export function load() {
  throw redirect(301, '/new-page');
}
~~~

### Rest Parameter

A route parameter that matches multiple path segments. Denoted by `[...param]` in the directory name.

**Example:**

~~~
src/routes/[...path]/+page.svelte
~~~

**See also:** [Advanced Routing](/advanced/advanced-routing/)

### Route

A URL pattern that maps to a page or endpoint. Defined by the directory structure in `src/routes/`.

### Route Group

A directory with parentheses in the name that doesn't affect the URL. Used for organizing routes and applying layouts.

**Example:**

~~~
src/routes/
├ (marketing)/
│ ├ about/+page.svelte
│ └ contact/+page.svelte
└ (app)/
  ├ dashboard/+page.svelte
  └ settings/+page.svelte
~~~

Both `/about` and `/dashboard` are valid URLs.

## S

### Server-Side Rendering (SSR)

Rendering pages on the server before sending them to the client. Improves initial load time and SEO.

**Configuration:**

~~~js
// src/routes/+layout.js
export const ssr = true;
~~~

**See also:** [Page Options](/core-concepts/page-options/)

### Slot

A placeholder in a component where parent content can be inserted. Replaced by snippets in Svelte 5.

**Before (Svelte 4):**

~~~svelte
<!-- Child -->
<slot />

<!-- Parent -->
<Child>Content</Child>
~~~

**After (Svelte 5):**

~~~svelte
<!-- Child -->
<script>
  let { children } = $props();
</script>
{@render children()}

<!-- Parent -->
<Child>Content</Child>
~~~

### Snippet

A reusable block of markup in Svelte 5. Replaces slots for passing content to components.

**Example:**

~~~svelte
{#snippet header()}
  <h1>Title</h1>
{/snippet}

{@render header()}
~~~

### Static Site Generation (SSG)

Generating all pages as static HTML at build time. Suitable for content that doesn't change frequently.

**See also:** [Static Site Generation](/build-and-deploy/static-site-generation/)

### Store

A reactive object that holds state and notifies subscribers when it changes. SvelteKit provides built-in stores like `page` and `navigating`.

**Usage:**

~~~svelte
<script>
  import { page } from '$app/stores';
</script>

<p>Current path: {$page.url.pathname}</p>
~~~

## T

### Trailing Slash

Whether URLs should end with a slash. Configurable per route.

**Configuration:**

~~~js
// src/routes/+layout.js
export const trailingSlash = 'always'; // or 'never' or 'ignore'
~~~

## U

### Universal Load

A load function that runs on both server and client. Defined in `+page.js` files.

**Example:**

~~~js
// src/routes/posts/+page.js
export async function load({ fetch }) {
  const response = await fetch('/api/posts');
  return { posts: await response.json() };
}
~~~

## V

### Vite

The build tool that powers SvelteKit. Handles module bundling, hot module replacement, and optimizations.

**Configuration:**

~~~js
// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()]
});
~~~

## W

### Web Standard APIs

Browser APIs that SvelteKit uses, including `Request`, `Response`, `Headers`, `URL`, and `fetch`.

## Next Steps

Now, move on to the [Configuration](/reference/configuration/) page.
