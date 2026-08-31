---
title: Basic Routing
description: Learn how SvelteKit's file-based routing system works
---


SvelteKit uses file-based routing, which means your application's routes are determined by the files and folders inside src/routes/.

## Page Routes

The most common type of route is a page route — a page that users can visit in their browser. To create a page, add a +page.svelte file inside a route folder.

For example, to create a homepage at /, add this file:

src/routes/+page.svelte

With this content:

~~~svelte
<h1>Welcome to my app</h1>
<p>This is the homepage.</p>
~~~

To create an /about page, add a folder and file:

src/routes/about/+page.svelte

## Index Files

A +page.svelte file inside a folder becomes the default page for that route. For example:

| File | URL |
|---|---|
| src/routes/+page.svelte | / |
| src/routes/about/+page.svelte | /about |
| src/routes/blog/+page.svelte | /blog |

## Nested Routes

Routes can be nested to create URL hierarchies. For example, a blog with individual posts:

src/routes/
├ blog/
│   ├ +page.svelte          → /blog
│   └ [slug]/
│       └ +page.svelte      → /blog/my-first-post

The [slug] folder is a dynamic route — we'll cover those below.

## Dynamic Routes

To capture a value from the URL, wrap the folder name in square brackets. For example, [id] matches any value:

src/routes/products/[id]/+page.svelte

This route matches:
- /products/1
- /products/abc
- /products/my-product-name

Inside the page component, you can access the parameter using the page store:

~~~svelte
<script>
  import { page } from '$app/stores';
</script>

<h1>Product: {$page.params.id}</h1>
~~~

## Layouts

To create a layout that wraps multiple pages, add a +layout.svelte file. Layouts apply to the current folder and all its subfolders.

src/routes/
├ +layout.svelte            → applies to all pages
├ +page.svelte              → /
├ about/
│   └ +page.svelte          → /about
└ blog/
    ├ +layout.svelte        → applies to /blog and /blog/*
    ├ +page.svelte          → /blog
    └ [slug]/
        └ +page.svelte      → /blog/[slug]

A basic layout file looks like this:

~~~svelte
<script>
  let { children } = $props();
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

The children prop renders the page content (or a nested layout).

## API Routes

To create an endpoint that returns data instead of HTML, use a +server.js file. This lets you handle HTTP methods like GET, POST, PUT, and DELETE.

src/routes/api/hello/+server.js

With this content:

~~~js
export function GET() {
  return new Response(JSON.stringify({ message: 'Hello, world!' }));
}
~~~

Visiting /api/hello returns the JSON response.

## Summary

| Concept | File | Purpose |
|---|---|---|
| Page | +page.svelte | A user-visible page |
| Layout | +layout.svelte | Shared UI for multiple pages |
| Server | +server.js | API endpoint |
| Dynamic | [param]/ | Captures URL values |

## Next Steps

Now that you understand routing, you're ready to learn how to build and deploy your application.
