---
title: Loading Data
description: Learn how to fetch and load data for your SvelteKit pages using load functions
---

# Loading Data

Most applications need to load data from a database, API, or other source before rendering a page. SvelteKit provides a powerful `load` function that lets you fetch data and pass it to your page components.

## How Loading Works

In SvelteKit, you create a `+page.js` (or `+page.ts` for TypeScript) file alongside your `+page.svelte` file. This file exports a `load` function that runs before the page renders.

~~~
src/routes/blog/
├ +page.js        ← load function
└ +page.svelte    ← page component
~~~

## Basic Example

Here's a simple example that loads blog posts:

~~~js
// src/routes/blog/+page.js
export function load() {
  return {
    posts: [
      { title: 'First Post', slug: 'first-post' },
      { title: 'Second Post', slug: 'second-post' }
    ]
  };
}
~~~

Then access the data in your page component:

~~~svelte
<!-- src/routes/blog/+page.svelte -->
<script>
  let { data } = $props();
</script>

<h1>Blog Posts</h1>

<ul>
  {#each data.posts as post}
    <li>
      <a href="/blog/{post.slug}">{post.title}</a>
    </li>
  {/each}
</ul>
~~~

## Where Load Functions Run

Load functions can run on the server or in the browser, depending on the file you create:

| File | Where it runs | Use case |
|---|---|---|
| `+page.js` | Browser (default) or server (if needed) | Universal code |
| `+page.server.js` | Server only | Database queries, private APIs |
| `+layout.js` | Browser (default) or server | Shared data for multiple pages |
| `+layout.server.js` | Server only | Shared server-only data |

### Server-Only Data

If your load function needs to access secrets, database credentials, or private APIs, use `+page.server.js`:

~~~js
// src/routes/dashboard/+page.server.js
import { db } from '$lib/server/database';

export async function load({ cookies }) {
  const session = cookies.get('session');

  if (!session) {
    throw redirect(302, '/login');
  }

  const user = await db.getUser(session);

  return {
    user
  };
}
~~~

This file never runs in the browser, so it's safe to import sensitive modules.

## The Load Function Event

Your `load` function receives an `event` object with useful properties and methods:

~~~js
export async function load({ params, url, fetch, cookies, locals }) {
  // params — route parameters (e.g., { slug: 'my-post' })
  // url — the current URL object
  // fetch — a fetch function for making API calls
  // cookies — read/write cookies
  // locals — server-side data from hooks

  const response = await fetch(`/api/posts/${params.slug}`);
  const post = await response.json();

  return { post };
}
~~~

### Common Event Properties

| Property | Description |
|---|---|
| `params` | Route parameters from the URL |
| `url` | The current URL object |
| `fetch` | Fetch function for API calls |
| `cookies` | Cookie read/write interface |
| `locals` | Data from server hooks |
| `parent()` | Access parent layout data |
| `depends()` | Mark dependencies for invalidation |

## Fetching from APIs

Use the `fetch` function provided in the event to call your API routes:

~~~js
// src/routes/posts/[id]/+page.js
export async function load({ params, fetch }) {
  const response = await fetch(`/api/posts/${params.id}`);

  if (!response.ok) {
    throw error(404, 'Post not found');
  }

  const post = await response.json();

  return { post };
}
~~~

## Layout Data

To share data across multiple pages, use a `+layout.js` file:

~~~js
// src/routes/+layout.js
export async function load({ fetch }) {
  const response = await fetch('/api/user');
  const user = await response.json();

  return { user };
}
~~~

Now every page in your app has access to `data.user`:

~~~svelte
<script>
  let { data } = $props();
</script>

<nav>
  <span>Welcome, {data.user.name}</span>
</nav>
~~~

## Error Handling

If your load function fails, you can throw an error to show an error page:

~~~js
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const post = await getPost(params.slug);

  if (!post) {
    throw error(404, 'Post not found');
  }

  return { post };
}
~~~

## Redirects

To redirect users (e.g., to a login page), use the `redirect` function:

~~~js
import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
  if (!cookies.get('session')) {
    throw redirect(302, '/login');
  }

  return { user: await getUser(cookies.get('session')) };
}
~~~

## Parallel Loading

SvelteKit automatically runs multiple load functions in parallel when navigating to a new page. If your page has a layout and a page load function, both run at the same time:

~~~
src/routes/
├ +layout.js      ← runs in parallel
└ blog/
    └ +page.js    ← runs in parallel
~~~

This improves performance by loading data concurrently instead of sequentially.

## Data Validation

You can validate the data returned from your load function using TypeScript:

~~~ts
// src/routes/blog/+page.ts
import type { PageLoad } from './$types';

interface Post {
  title: string;
  slug: string;
}

export const load: PageLoad = async (): Promise<{ posts: Post[] }> => {
  const response = await fetch('/api/posts');
  const posts: Post[] = await response.json();

  return { posts };
};
~~~

## Caching and Revalidation

Control how data is cached using the `cache` option:

~~~js
export async function load({ fetch }) {
  const response = await fetch('/api/data', {
    cache: 'no-store' // Always fetch fresh data
  });

  return response.json();
}
~~~

Common cache strategies:
- `default` — Use browser's default caching
- `no-store` — Always fetch fresh data
- `force-cache` — Use cached data if available

## Summary

| Concept | File | Purpose |
|---|---|---|
| Page load | `+page.js` | Load data for a single page |
| Server load | `+page.server.js` | Load server-only data |
| Layout load | `+layout.js` | Share data across pages |
| Error handling | `error()` | Show error pages |
| Redirects | `redirect()` | Redirect to other pages |

## Next Steps

Now that you know how to load data, learn how to handle user input with [Form Actions](/core-concepts/form-actions/).
