---
title: State Management
description: Share data across components using stores, context, and SvelteKit's built-in patterns
---


As your application grows, you need ways to share data between components. Svelte provides several patterns for state management, from simple component state to global stores. SvelteKit adds its own patterns on top for page and layout data.

## Component State

The simplest form of state is local to a component. Use `$state` for reactive values:

~~~svelte
<script>
  let count = $state(0);
</script>

<button onclick={() => count++}>
  Count: {count}
</button>
~~~

Every time `count` changes, the component re-renders automatically.

## Derived State

Use `$derived` to compute values from other state:

~~~svelte
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>

<p>Count: {count}, Doubled: {doubled}</p>
~~~

`doubled` updates automatically whenever `count` changes.

## Passing Data with Props

Pass data from parent to child components using props:

~~~svelte
<!-- Parent.svelte -->
<script>
  let user = { name: 'Alice' };
</script>

<Child {user} />
~~~

~~~svelte
<!-- Child.svelte -->
<script>
  let { user } = $props();
</script>

<p>Hello, {user.name}</p>
~~~

## Stores for Global State

When multiple unrelated components need access to the same data, use stores. Svelte provides three types of stores:

### Writable Stores

A writable store can be updated from anywhere:

~~~js
// src/lib/stores/user.js
import { writable } from 'svelte/store';

export const user = writable(null);
~~~

Use it in components:

~~~svelte
<script>
  import { user } from '$lib/stores/user.js';
</script>

{#if $user}
  <p>Welcome, {$user.name}</p>
{:else}
  <p>Please log in</p>
{/if}
~~~

The `$` prefix automatically subscribes to the store and updates when it changes.

### Readable Stores

A readable store is read-only — useful for values computed from external sources:

~~~js
import { readable } from 'svelte/store';

export const time = readable(new Date(), (set) => {
  const interval = setInterval(() => {
    set(new Date());
  }, 1000);

  return () => clearInterval(interval);
});
~~~

The function passed to `readable` runs when the first subscriber joins, and the returned cleanup function runs when the last subscriber leaves.

### Derived Stores

A derived store computes its value from other stores:

~~~js
import { derived } from 'svelte/store';
import { user } from './user.js';

export const isLoggedIn = derived(user, ($user) => !!$user);
~~~

## The Context API

For sharing data within a component tree (without prop drilling), use the context API:

~~~svelte
<!-- Parent.svelte -->
<script>
  import { setContext } from 'svelte';

  setContext('theme', { color: 'blue' });
</script>
~~~

~~~svelte
<!-- Child.svelte -->
<script>
  import { getContext } from 'svelte';

  const theme = getContext('theme');
</script>

<p style="color: {theme.color}">Themed text</p>
~~~

Context is useful when many nested components need the same data — for example, a theme, a form state, or a localization object.

## Page Data

Data loaded in `+page.js` is automatically available to the page component through the `data` prop:

~~~js
// src/routes/blog/+page.js
export async function load({ fetch }) {
  const response = await fetch('/api/posts');
  const posts = await response.json();
  return { posts };
}
~~~

~~~svelte
<!-- src/routes/blog/+page.svelte -->
<script>
  let { data } = $props();
</script>

{#each data.posts as post}
  <h2>{post.title}</h2>
{/each}
~~~

## Layout Data

Share data across multiple pages using layout files:

~~~js
// src/routes/+layout.js
export async function load({ fetch }) {
  const response = await fetch('/api/user');
  const user = await response.json();
  return { user };
}
~~~

Every page in your app can now access `data.user`. Layout data merges with page data — you don't lose page-level data when using a layout.

## URL State

SvelteKit provides stores for reading the current URL:

~~~svelte
<script>
  import { page } from '$app/stores';
</script>

<p>Current path: {$page.url.pathname}</p>
<p>Query param: {$page.url.searchParams.get('q')}</p>
~~~

The `page` store contains:
- `url` — The current URL object
- `params` — Route parameters
- `route` — The current route ID
- `status` — The page's status code
- `error` — The current error (if any)
- `data` — The merged page and layout data
- `form` — Form action result (if any)

## Navigation State

Track navigation state with the `navigating` store:

~~~svelte
<script>
  import { navigating } from '$app/stores';
</script>

{#if $navigating}
  <div class="loading-bar">Loading...</div>
{/if}
~~~

## When to Use What

| Pattern | Use case |
|---|---|
| `$state` | Component-local reactive state |
| `$derived` | Computed values from other state |
| Props | Passing data to child components |
| Stores | Global state shared across unrelated components |
| Context | Sharing data within a component tree |
| `data` prop | Page-specific data from load functions |
| `page` store | URL, params, and navigation state |

## Best Practices

- **Start simple** — Use component state and props before reaching for stores
- **Keep stores focused** — Each store should have a single responsibility
- **Use TypeScript** — Type your stores and data for better developer experience
- **Avoid over-sharing** — Don't put everything in global stores
- **Prefer layout data** — For data shared across pages, use `+layout.js` instead of stores
- **Use context for trees** — When only a subtree needs data, context is cleaner than global stores

## Summary

| Tool | Scope | Reactive? |
|---|---|---|
| `$state` | Component | Yes |
| `$derived` | Component | Yes |
| Props | Parent to child | Yes |
| Stores | Global | Yes |
| Context | Component subtree | No |
| `data` prop | Page + layout | Yes |
| `page` store | App-wide | Yes |

## Next Steps

Next, explore the [Advanced Topics](/advanced-topics/hooks/) to learn about hooks, service workers, and deployment.
