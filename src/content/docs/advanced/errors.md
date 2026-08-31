---
title: Errors
description: Handle errors gracefully with the error function, error components, and error boundaries
---


Every application encounters errors — invalid user input, failed API calls, database outages, and unexpected exceptions. SvelteKit provides a structured error handling system that lets you display meaningful error messages to users while logging details for debugging.

## The `error` Function

Use the `error` function to throw an HTTP error from a `load` function, form action, or API route:

~~~js
// src/routes/blog/[slug]/+page.js
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const response = await fetch(`/api/posts/${params.slug}`);

  if (!response.ok) {
    throw error(404, {
      message: 'Post not found'
    });
  }

  const post = await response.json();
  return { post };
}
~~~

The `error` function takes two arguments:
- **Status code** — An HTTP status code (400-599)
- **Body** — An object with a `message` property and any additional data

### Status Codes

Common status codes:

| Code | Meaning | Use Case |
|---|---|---|
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | Logged in but no permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Internal Server Error | Unexpected server error |

### Throwing Errors in Load Functions

When you throw an error in a `load` function, SvelteKit catches it and renders the nearest `+error.svelte` component:

~~~js
// src/routes/products/[id]/+page.js
import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
  const response = await fetch(`/api/products/${params.id}`);

  if (response.status === 404) {
    throw error(404, 'Product not found');
  }

  if (!response.ok) {
    throw error(500, 'Failed to load product');
  }

  return { product: await response.json() };
}
~~~

### Throwing Errors in Form Actions

Use `error` in form actions to return validation errors:

~~~js
// src/routes/login/+page.server.js
import { error, fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) {
    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');

    if (!email || !password) {
      return fail(400, { message: 'Email and password are required' });
    }

    const user = await authenticate(email, password);

    if (!user) {
      return fail(401, { message: 'Invalid credentials' });
    }

    // Success
    return { success: true };
  }
};
~~~

## The `+error.svelte` Component

Create an error component to display error messages:

~~~svelte
<!-- src/routes/+error.svelte -->
<script>
  import { page } from '$app/stores';
</script>

<div class="error-page">
  <h1>{$page.status}</h1>
  <p>{$page.error.message}</p>
  <a href="/">Go home</a>
</div>
~~~

The `$page` store contains:
- `status` — The HTTP status code
- `error` — The error object with `message` and any custom properties

### Nested Error Components

Error components can be nested. SvelteKit uses the nearest `+error.svelte` component:

~~~
src/routes/
├ +error.svelte           → Catches errors for all routes
├ blog/
│   ├ +error.svelte       → Catches errors for /blog/*
│   └ [slug]/
│       └ +page.svelte
└ about/
    └ +page.svelte
~~~

If an error occurs in `/blog/[slug]`, the blog error component is used. If an error occurs in `/about`, the root error component is used.

### Custom Error Data

Pass custom data with the error:

~~~js
import { error } from '@sveltejs/kit';

throw error(404, {
  message: 'Post not found',
  suggestedPosts: ['post-1', 'post-2']
});
~~~

Access the custom data in your error component:

~~~svelte
<!-- src/routes/blog/+error.svelte -->
<script>
  import { page } from '$app/stores';
</script>

<h1>{$page.status}</h1>
<p>{$page.error.message}</p>

{#if $page.error.suggestedPosts}
  <h2>Suggested posts:</h2>
  <ul>
    {#each $page.error.suggestedPosts as post}
      <li><a href="/blog/{post}">{post}</a></li>
    {/each}
  </ul>
{/if}
~~~

## Error Boundaries

Error boundaries let you catch errors in specific parts of your component tree. Use Svelte's `{#catch}` block:

~~~svelte
<script>
  import { onMount } from 'svelte';

  let data = $state(null);
  let error = $state(null);

  onMount(async () => {
    try {
      const response = await fetch('/api/data');
      data = await response.json();
    } catch (e) {
      error = e;
    }
  });
</script>

{#if error}
  <div class="error">
    <p>Failed to load data: {error.message}</p>
    <button onclick={() => location.reload()}>Retry</button>
  </div>
{:else if data}
  <div class="content">
    {data.content}
  </div>
{:else}
  <div class="loading">Loading...</div>
{/if}
~~~

### Component-Level Error Handling

For reusable components, handle errors internally:

~~~svelte
<!-- Image.svelte -->
<script>
  let { src, alt } = $props();
  let error = $state(false);
</script>

{#if error}
  <div class="image-placeholder">
    <span>Image failed to load</span>
  </div>
{:else}
  <img {src} {alt} onerror={() => error = true} />
{/if}
~~~

## The `handleError` Hook

For global error handling, use the `handleError` hook:

~~~js
// src/hooks.server.js
export async function handleError({ error, event, status, message }) {
  // Log to your error tracking service
  console.error(`[${status}] ${event.url.pathname}: ${message}`, error);

  // Send to external service
  await fetch('https://error-tracking.example.com/api/errors', {
    method: 'POST',
    body: JSON.stringify({
      error: error.message,
      stack: error.stack,
      url: event.url.pathname,
      status,
      timestamp: Date.now()
    })
  });

  // Return custom error object
  return {
    message: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR'
  };
}
~~~

The object returned from `handleError` is passed to your `+error.svelte` component.

### Client-Side Error Handling

Handle client-side errors with `hooks.client.js`:

~~~js
// src/hooks.client.js
export async function handleError({ error, event, status, message }) {
  // Log client-side errors
  console.error(`[Client Error] ${event.url.pathname}: ${message}`, error);

  return {
    message: 'Something went wrong on the client',
    code: 'CLIENT_ERROR'
  };
}
~~~

## Error Handling in API Routes

Return appropriate error responses from API routes:

~~~js
// src/routes/api/users/[id]/+server.js
import { json, error } from '@sveltejs/kit';

export async function GET({ params }) {
  const user = await getUser(params.id);

  if (!user) {
    throw error(404, { message: 'User not found' });
  }

  return json(user);
}

export async function DELETE({ params, locals }) {
  if (!locals.user) {
    throw error(401, { message: 'Not authenticated' });
  }

  if (locals.user.id !== params.id) {
    throw error(403, { message: 'Cannot delete other users' });
  }

  await deleteUser(params.id);
  return json({ success: true });
}
~~~

## Validation Errors

For form validation, use `fail` instead of `error`:

~~~js
// src/routes/register/+page.server.js
import { fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');

    const errors = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!email.includes('@')) {
      errors.email = 'Invalid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(errors).length > 0) {
      return fail(400, errors);
    }

    // Success
    return { success: true };
  }
};
~~~

Display validation errors in the form:

~~~svelte
<!-- src/routes/register/+page.svelte -->
<script>
  let { form } = $props();
</script>

<form method="POST">
  <div>
    <label for="email">Email</label>
    <input type="email" id="email" name="email" value={form?.email || ''} />
    {#if form?.errors?.email}
      <span class="error">{form.errors.email}</span>
    {/if}
  </div>

  <div>
    <label for="password">Password</label>
    <input type="password" id="password" name="password" />
    {#if form?.errors?.password}
      <span class="error">{form.errors.password}</span>
    {/if}
  </div>

  <button type="submit">Register</button>
</form>
~~~

## Error Styling

Style your error pages consistently:

~~~svelte
<!-- src/routes/+error.svelte -->
<script>
  import { page } from '$app/stores';
</script>

<div class="error-container">
  <div class="error-code">{$page.status}</div>
  <h1 class="error-title">
    {#if $page.status === 404}
      Page Not Found
    {:else if $page.status === 403}
      Access Denied
    {:else if $page.status >= 500}
      Server Error
    {:else}
      Error
    {/if}
  </h1>
  <p class="error-message">{$page.error.message}</p>
  <div class="error-actions">
    <a href="/" class="btn">Go Home</a>
    <button onclick={() => history.back()} class="btn btn-secondary">Go Back</button>
  </div>
</div>

<style>
  .error-container {
    text-align: center;
    padding: 4rem 2rem;
  }

  .error-code {
    font-size: 6rem;
    font-weight: bold;
    color: #666;
  }

  .error-title {
    font-size: 2rem;
    margin: 1rem 0;
  }

  .error-message {
    color: #666;
    margin-bottom: 2rem;
  }

  .error-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 0.25rem;
    text-decoration: none;
  }
</style>
~~~

## Summary

| Tool | Purpose |
|---|---|
| `error(status, body)` | Throw an HTTP error |
| `fail(status, body)` | Return validation errors from form actions |
| `+error.svelte` | Display error pages |
| `handleError` hook | Global error logging and transformation |
| `{#catch}` block | Component-level error boundaries |

## Next Steps

Learn how to control link behavior and preloading with [Link Options](/advanced/link-options/).
