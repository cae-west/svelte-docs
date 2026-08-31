---
title: Modules
description: Complete reference for SvelteKit's built-in modules and their exports
---


SvelteKit provides several built-in modules that give you access to framework functionality. These modules use the `$` prefix to distinguish them from your own code. This page documents all available modules and their exports.

## `$app/environment`

Utilities for detecting the runtime environment.

### `browser`

**Type:** `boolean`

`true` if the code is running in the browser, `false` if running on the server.

**Example:**

~~~js
import { browser } from '$app/environment';

if (browser) {
  console.log('Running in the browser');
  localStorage.setItem('key', 'value');
}
~~~

**Use case:** Conditionally execute browser-only code (accessing `window`, `localStorage`, etc.).

### `dev`

**Type:** `boolean`

`true` if the app is running in development mode, `false` in production.

**Example:**

~~~js
import { dev } from '$app/environment';

if (dev) {
  console.log('Development mode enabled');
}
~~~

**Use case:** Enable debugging tools or logging only in development.

### `building`

**Type:** `boolean`

`true` if the app is currently being built (prerendering).

**Example:**

~~~js
import { building } from '$app/environment';

if (!building) {
  // Only run during actual requests, not during build
  await fetchExternalAPI();
}
~~~

**Use case:** Skip operations during prerendering that require runtime data.

### `version`

**Type:** `string`

The SvelteKit version number.

**Example:**

~~~js
import { version } from '$app/environment';

console.log(`SvelteKit version: ${version}`);
~~~

## `$app/forms`

Utilities for working with forms.

### `enhance`

**Type:** `Action`

An action that enhances a form to use progressive enhancement.

**Example:**

~~~svelte
<script>
  import { enhance } from '$app/forms';

  let { form } = $props();
</script>

<form method="POST" use:enhance>
  <input type="email" name="email" />
  <button type="submit">Submit</button>

  {#if form?.success}
    <p>Form submitted successfully!</p>
  {/if}
</form>
~~~

**With custom handler:**

~~~svelte
<script>
  import { enhance } from '$app/forms';

  function handleSubmit({ formData, action, submitter, cancel, update }) {
    console.log('Submitting to:', action);

    // Custom validation
    if (!formData.get('email')) {
      alert('Email is required');
      cancel();
      return;
    }

    // Custom submission
    update({ reset: true });
  }
</script>

<form method="POST" use:enhance={handleSubmit}>
  <input type="email" name="email" />
  <button type="submit">Submit</button>
</form>
~~~

**Handler parameters:**

- `formData` — The form data being submitted
- `action` — The form action URL
- `submitter` — The button that triggered submission
- `cancel` — Function to cancel submission
- `update` — Function to update the form result

### `applyAction`

**Type:** `Function`

Programmatically apply a form action result.

**Example:**

~~~svelte
<script>
  import { applyAction, enhance } from '$app/forms';

  async function handleSubmit({ update }) {
    const result = await update({ invalidateAll: true });

    if (result.type === 'success') {
      // Handle success
      applyAction(result);
    }
  }
</script>

<form method="POST" use:enhance={handleSubmit}>
  <!-- form fields -->
</form>
~~~

## `$app/navigation`

Functions for programmatic navigation.

### `goto`

**Type:** `Function`

Navigate to a different URL programmatically.

**Signature:**

~~~ts
function goto(
  url: string,
  opts?: {
    replaceState?: boolean;
    noScroll?: boolean;
    keepFocus?: boolean;
    invalidateAll?: boolean;
    state?: any;
  }
): Promise<void>;
~~~

**Example:**

~~~svelte
<script>
  import { goto } from '$app/navigation';

  function navigateToProfile() {
    goto('/profile');
  }

  function navigateWithState() {
    goto('/dashboard', {
      state: { from: 'home' }
    });
  }

  function replaceCurrentPage() {
    goto('/new-page', { replaceState: true });
  }
</script>

<button onclick={navigateToProfile}>Go to Profile</button>
~~~

**Options:**

- `replaceState` — Replace the current history entry instead of pushing a new one
- `noScroll` — Don't scroll to the top after navigation
- `keepFocus` — Keep the currently focused element
- `invalidateAll` — Invalidate all data and refetch
- `state` — Custom state to attach to the history entry

### `invalidate`

**Type:** `Function`

Trigger a refetch of data for a specific URL.

**Signature:**

~~~ts
function invalidate(
  dependency: string | URL | ((url: URL) => boolean)
): Promise<void>;
~~~

**Example:**

~~~svelte
<script>
  import { invalidate } from '$app/navigation';

  async function refreshPosts() {
    await invalidate('/api/posts');
  }

  async function refreshAll() {
    await invalidate((url) => url.pathname.startsWith('/api'));
  }
</script>

<button onclick={refreshPosts}>Refresh Posts</button>
~~~

**Use case:** Manually refresh data after a mutation (create, update, delete).

### `invalidateAll`

**Type:** `Function`

Invalidate all data and trigger a complete refetch.

**Example:**

~~~svelte
<script>
  import { invalidateAll } from '$app/navigation';

  async function refreshEverything() {
    await invalidateAll();
  }
</script>

<button onclick={refreshEverything}>Refresh All Data</button>
~~~

**Use case:** After authentication changes or major state updates.

### `beforeNavigate`

**Type:** `Function`

Register a callback that runs before navigation.

**Signature:**

~~~ts
function beforeNavigate(
  callback: (navigation: {
    from: URL;
    to: URL | null;
    intent: 'link' | 'back' | 'forward' | 'reload';
    cancel: () => void;
  }) => void
): void;
~~~

**Example:**

~~~svelte
<script>
  import { beforeNavigate } from '$app/navigation';

  let hasUnsavedChanges = $state(false);

  beforeNavigate(({ to, cancel }) => {
    if (to && hasUnsavedChanges) {
      const confirmed = confirm('You have unsaved changes. Leave anyway?');
      if (!confirmed) {
        cancel();
      }
    }
  });
</script>

<form>
  <input type="text" oninput={() => hasUnsavedChanges = true} />
</form>
~~~

**Use case:** Warn users about unsaved changes before they leave a page.

### `afterNavigate`

**Type:** `Function`

Register a callback that runs after navigation completes.

**Signature:**

~~~ts
function afterNavigate(
  callback: (navigation: {
    from: URL | null;
    to: URL;
    willUnload: boolean;
    type: 'link' | 'back' | 'forward' | 'reload';
    delta: number;
  }) => void
): void;
~~~

**Example:**

~~~svelte
<script>
  import { afterNavigate } from '$app/navigation';

  afterNavigate(({ to }) => {
    // Track page views
    analytics.track('page_view', { path: to.pathname });

    // Scroll to top
    window.scrollTo(0, 0);
  });
</script>
~~~

**Use case:** Analytics tracking, scroll management, focus management.

### `onNavigate`

**Type:** `Function`

Register a callback that runs during navigation (Svelte 5).

**Example:**

~~~svelte
<script>
  import { onNavigate } from '$app/navigation';

  onNavigate((navigation) => {
    console.log('Navigating to:', navigation.to);
  });
</script>
~~~

## `$app/paths`

Utilities for working with paths.

### `base`

**Type:** `string`

The base path configured in `svelte.config.js`.

**Example:**

~~~js
import { base } from '$app/paths';

// If base is '/app'
const url = `${base}/profile`; // '/app/profile'
~~~

**Use case:** Construct URLs that respect the base path configuration.

### `assets`

**Type:** `string`

The base path for assets (configured in `svelte.config.js`).

**Example:**

~~~js
import { assets } from '$app/paths';

const imageUrl = `${assets}/images/logo.png`;
~~~

**Use case:** Reference static assets with the correct base path.

### `resolveRoute`

**Type:** `Function`

Generate a URL from a route ID and parameters.

**Signature:**

~~~ts
function resolveRoute(
  id: string,
  params: Record<string, string>
): string;
~~~

**Example:**

~~~js
import { resolveRoute } from '$app/paths';

const url = resolveRoute('/blog/[slug]', { slug: 'hello-world' });
// Result: '/blog/hello-world'
~~~

**Use case:** Type-safe route generation.

## `$app/stores`

Svelte stores for accessing page state.

### `page`

**Type:** `Readable<Page>`

A store containing information about the current page.

**Example:**

~~~svelte
<script>
  import { page } from '$app/stores';
</script>

<p>Current path: {$page.url.pathname}</p>
<p>Page status: {$page.status}</p>

{#if $page.error}
  <p>Error: {$page.error.message}</p>
{/if}
~~~

**Properties:**

- `url` — The current URL
- `params` — Route parameters
- `route` — Route information
- `status` — HTTP status code
- `error` — Error object (if any)
- `data` — Page data from load functions
- `form` — Form action result

### `navigating`

**Type:** `Readable<Navigation | null>`

A store indicating whether navigation is in progress.

**Example:**

~~~svelte
<script>
  import { navigating } from '$app/stores';
</script>

{#if $navigating}
  <div class="loading">Loading...</div>
{/if}
~~~

**Properties:**

- `from` — The URL being navigated from
- `to` — The URL being navigated to
- `type` — Navigation type ('link', 'back', 'forward', 'reload')

### `updated`

**Type:** `Readable<boolean>`

A store indicating whether a new version of the app is available.

**Example:**

~~~svelte
<script>
  import { updated } from '$app/stores';
</script>

{#if $updated}
  <div class="update-banner">
    A new version is available.
    <button onclick={() => location.reload()}>Refresh</button>
  </div>
{/if}
~~~

**Use case:** Notify users when they should refresh to get the latest version.

## `$app/state`

Svelte 5 state utilities (replaces `$app/stores`).

### `page`

**Type:** `State<Page>`

Reactive state containing page information.

**Example (Svelte 5):**

~~~svelte
<script>
  import { page } from '$app/state';
</script>

<p>Current path: {page.url.pathname}</p>
<p>Page status: {page.status}</p>
~~~

**Note:** In Svelte 5, you don't need the `$` prefix to access store values.

### `navigating`

**Type:** `State<Navigation | null>`

Reactive state for navigation progress.

**Example (Svelte 5):**

~~~svelte
<script>
  import { navigating } from '$app/state';
</script>

{#if navigating}
  <div class="loading">Loading...</div>
{/if}
~~~

### `updated`

**Type:** `State<boolean>`

Reactive state for app updates.

**Example (Svelte 5):**

~~~svelte
<script>
  import { updated } from '$app/state';
</script>

{#if updated}
  <button onclick={() => location.reload()}>Update Available</button>
{/if}
~~~

## `$env/static/public`

Static public environment variables (available at build time).

**Example:**

~~~js
import { PUBLIC_API_URL } from '$env/static/public';

console.log(PUBLIC_API_URL); // Available in both server and client
~~~

**Rules:**

- Must start with `PUBLIC_` prefix (configurable)
- Available in both server and client code
- Embedded at build time (cannot change without rebuilding)

**Configuration:**

~~~js
// svelte.config.js
export default {
  kit: {
    env: {
      publicPrefix: 'PUBLIC_'
    }
  }
};
~~~

## `$env/static/private`

Static private environment variables (available at build time).

**Example:**

~~~js
import { DATABASE_URL } from '$env/static/private';

// Only available in server code
export async function load() {
  const db = connect(DATABASE_URL);
}
~~~

**Rules:**

- Cannot start with `PUBLIC_` prefix
- Only available in server code
- Embedded at build time

**Security:** Never expose private variables to the client.

## `$env/dynamic/public`

Dynamic public environment variables (available at runtime).

**Example:**

~~~js
import { env } from '$env/dynamic/public';

console.log(env.PUBLIC_API_URL); // Available in both server and client
~~~

**Difference from static:**

- Read at runtime instead of build time
- Can change without rebuilding
- Slightly slower than static imports

**Use case:** Environment variables that change between deployments.

## `$env/dynamic/private`

Dynamic private environment variables (available at runtime).

**Example:**

~~~js
import { env } from '$env/dynamic/private';

// Only available in server code
export async function load() {
  const db = connect(env.DATABASE_URL);
}
~~~

**Rules:**

- Only available in server code
- Read at runtime

## `$lib`

Import from your `src/lib` directory.

**Example:**

~~~js
import Button from '$lib/components/Button.svelte';
import { formatDate } from '$lib/utils/date';
~~~

**Configuration:**

The `$lib` alias is automatically configured to point to `src/lib`. You can customize this in `svelte.config.js`:

~~~js
export default {
  kit: {
    files: {
      lib: 'src/lib'
    }
  }
};
~~~

## `$service-worker`

Utilities for service workers.

**Example:**

~~~js
// src/service-worker.js
import { build, files, version } from '$service-worker';

const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
~~~

**Exports:**

- `build` — Array of built asset paths
- `files` — Array of static file paths
- `version` — Build version (for cache busting)

## Module Summary

| Module | Purpose | Server | Client |
|---|---|---|---|
| `$app/environment` | Environment detection | ✅ | ✅ |
| `$app/forms` | Form utilities | ❌ | ✅ |
| `$app/navigation` | Navigation functions | ❌ | ✅ |
| `$app/paths` | Path utilities | ✅ | ✅ |
| `$app/stores` | Page state stores | ✅ | ✅ |
| `$app/state` | Page state (Svelte 5) | ✅ | ✅ |
| `$env/static/public` | Public env vars (build time) | ✅ | ✅ |
| `$env/static/private` | Private env vars (build time) | ✅ | ❌ |
| `$env/dynamic/public` | Public env vars (runtime) | ✅ | ✅ |
| `$env/dynamic/private` | Private env vars (runtime) | ✅ | ❌ |
| `$lib` | Library imports | ✅ | ✅ |
| `$service-worker` | Service worker utilities | ❌ | ❌ |

## Common Patterns

### Conditional Browser Code

~~~js
import { browser } from '$app/environment';

export function getLocalStorage(key) {
  if (!browser) return null;
  return localStorage.getItem(key);
}
~~~

### Development-Only Logging

~~~js
import { dev } from '$app/environment';

export function log(message) {
  if (dev) {
    console.log(`[DEV] ${message}`);
  }
}
~~~

### Form Submission with Navigation

~~~svelte
<script>
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';

  async function handleSubmit({ update }) {
    const result = await update();
    if (result.type === 'redirect') {
      goto(result.location);
    }
  }
</script>

<form method="POST" use:enhance={handleSubmit}>
  <!-- form fields -->
</form>
~~~

### Loading Indicator

~~~svelte
<script>
  import { navigating } from '$app/stores';
</script>

{#if $navigating}
  <div class="loading-overlay">
    <div class="spinner"></div>
  </div>
{/if}
~~~

### Unsaved Changes Warning

~~~svelte
<script>
  import { beforeNavigate } from '$app/navigation';

  let hasChanges = $state(false);

  beforeNavigate(({ cancel }) => {
    if (hasChanges) {
      if (!confirm('You have unsaved changes. Leave anyway?')) {
        cancel();
      }
    }
  });
</script>

<form oninput={() => hasChanges = true}>
  <!-- form fields -->
</form>
~~~

## Next Steps

Learn about Web Standards used in SvelteKit in [Web Standards](/reference/web-standards/).
