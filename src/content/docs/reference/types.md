---
title: Types
description: Complete reference for TypeScript types in SvelteKit
---

# Types

SvelteKit provides comprehensive TypeScript support with generated types that ensure type safety throughout your application. This page documents all available types and how to use them.

## Generated Types

SvelteKit automatically generates TypeScript types based on your routes and configuration. These types are available in the `./$types` module for each route.

### PageLoad

Type for page load functions in `+page.ts` or `+page.js`.

**Example:**

~~~ts
// src/routes/blog/[slug]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  return {
    slug: params.slug
  };
};
~~~

**Generic parameters:**

~~~ts
import type { PageLoad } from './$types';

// With explicit types
export const load: PageLoad<{ slug: string }> = async ({ params }) => {
  return {
    slug: params.slug  // Typed as string
  };
};
~~~

### PageData

Type for the data returned by a page load function.

**Example:**

~~~svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<h1>{data.title}</h1>
~~~

### PageServerLoad

Type for server-only page load functions in `+page.server.ts`.

**Example:**

~~~ts
// src/routes/admin/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  return {
    user: locals.user
  };
};
~~~

### LayoutLoad

Type for layout load functions in `+layout.ts`.

**Example:**

~~~ts
// src/routes/+layout.ts
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
  const response = await fetch('/api/user');
  const user = await response.json();

  return { user };
};
~~~

### LayoutData

Type for data returned by a layout load function.

**Example:**

~~~svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import type { LayoutData } from './$types';

  let { data }: { data: LayoutData } = $props();
</script>

<nav>Welcome, {data.user?.name}</nav>
<slot />
~~~

### LayoutServerLoad

Type for server-only layout load functions in `+layout.server.ts`.

**Example:**

~~~ts
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
  const session = cookies.get('session');
  return { session };
};
~~~

### Actions

Type for form actions in `+page.server.ts`.

**Example:**

~~~ts
// src/routes/login/+page.server.ts
import type { Actions } from './$types';

export const actions: Actions = {
  login: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');

    // Process login
    return { success: true };
  },

  register: async ({ request }) => {
    const data = await request.formData();
    // Process registration
    return { success: true };
  }
};
~~~

### RequestHandler

Type for API endpoints in `+server.ts`.

**Example:**

~~~ts
// src/routes/api/posts/+server.ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const posts = await getPosts();

  return new Response(JSON.stringify(posts), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json();
  const post = await createPost(data);

  return new Response(JSON.stringify(post), {
    status: 201,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
~~~

### EntryGenerator

Type for entry generators in prerendering.

**Example:**

~~~ts
// src/routes/blog/[slug]/+page.ts
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = async () => {
  const posts = await getAllPosts();

  return posts.map(post => ({
    slug: post.slug
  }));
};
~~~

## App-Level Types

Define app-wide types in `src/app.d.ts`. These types are available throughout your application.

### Locals

Request-scoped data that persists throughout the request lifecycle.

**Example:**

~~~ts
// src/app.d.ts
declare global {
  namespace App {
    interface Locals {
      user?: {
        id: string;
        name: string;
        email: string;
      };
      session?: string;
    }
  }
}

export {};
~~~

**Usage in hooks:**

~~~ts
// src/hooks.server.ts
export async function handle({ event, resolve }) {
  const session = event.cookies.get('session');

  if (session) {
    event.locals.user = await validateSession(session);
  }

  return await resolve(event);
}
~~~

**Usage in load functions:**

~~~ts
// src/routes/profile/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  return {
    user: locals.user
  };
};
~~~

### PageData

Global page data type that applies to all pages.

**Example:**

~~~ts
// src/app.d.ts
declare global {
  namespace App {
    interface PageData {
      flash?: {
        type: 'success' | 'error' | 'info';
        message: string;
      };
    }
  }
}

export {};
~~~

### LayoutData

Global layout data type that applies to all layouts.

**Example:**

~~~ts
// src/app.d.ts
declare global {
  namespace App {
    interface LayoutData {
      theme: 'light' | 'dark';
      locale: string;
    }
  }
}

export {};
~~~

### Error

Custom error type for your application.

**Example:**

~~~ts
// src/app.d.ts
declare global {
  namespace App {
    interface Error {
      code?: string;
      traceId?: string;
    }
  }
}

export {};
~~~

**Usage:**

~~~ts
// src/routes/api/data/+server.ts
import { error } from '@sveltejs/kit';

export const GET = async () => {
  throw error(500, {
    message: 'Database connection failed',
    code: 'DB_ERROR',
    traceId: 'abc123'
  });
};
~~~

### Platform

Platform-specific properties provided by adapters.

**Example:**

~~~ts
// src/app.d.ts
declare global {
  namespace App {
    interface Platform {
      env?: {
        get(name: string): string | undefined;
      };
      context: {
        waitUntil(promise: Promise<any>): void;
      };
      caches: CacheStorage;
    }
  }
}

export {};
~~~

**Usage:**

~~~ts
// src/routes/api/data/+server.ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ platform }) => {
  if (platform?.env) {
    const apiKey = platform.env.get('API_KEY');
  }

  return new Response('ok');
};
~~~

## Type Safety Patterns

### Type-Safe Load Functions

Always use generated types for load functions:

~~~ts
// ✅ Good
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  return { slug: params.slug };
};

// ❌ Bad - no type safety
export async function load({ params }) {
  return { slug: params.slug };
}
~~~

### Type-Safe Props

Use generated types for component props:

~~~svelte
<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<h1>{data.title}</h1>
~~~

### Type-Safe Form Actions

Define action types explicitly:

~~~ts
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email') as string;

    if (!email.includes('@')) {
      return fail(400, { email, error: 'Invalid email' });
    }

    return { success: true };
  }
};
~~~

### Type-Safe API Endpoints

Use RequestHandler for API endpoints:

~~~ts
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();

  // Type-safe body handling
  const { title, content } = body as { title: string; content: string };

  const post = await createPost({ title, content });

  return Response.json(post, { status: 201 });
};
~~~

## Common Type Issues

### "Cannot find module './$types'"

This happens when types haven't been generated. Run:

~~~bash
npx svelte-kit sync
~~~

Or run the check command:

~~~bash
npm run check
~~~

### "Property 'X' does not exist on type 'Y'"

This usually means you're using the wrong type or the type hasn't been updated. Solutions:

1. Run `npx svelte-kit sync`
2. Check that you're importing from `./$types`
3. Verify the type exists in `.svelte-kit/types/`

### "Type 'X' is not assignable to type 'Y'"

This is a type mismatch. Check that:

- You're returning the correct data shape
- Your load function signature matches the expected type
- Your props match the component's expected types

### "Property 'locals' does not exist"

You need to define `Locals` in `app.d.ts`:

~~~ts
// src/app.d.ts
declare global {
  namespace App {
    interface Locals {
      user?: User;
    }
  }
}

export {};
~~~

## Type Generation

### When Types Are Generated

Types are generated:

- When you run `npx svelte-kit sync`
- When you run `npm run check`
- When you run `npm run build`
- When you start the dev server

### Where Types Are Stored

Generated types are stored in `.svelte-kit/types/`:

~~~
.svelte-kit/
└ types/
  └ src/
    └ routes/
      └ blog/
        └ [slug]/
          ├ $types.d.ts
          └ ...
~~~

### Type Structure

Each route gets a `$types.d.ts` file with:

~~~ts
// .svelte-kit/types/src/routes/blog/[slug]/$types.d.ts
import type * as Kit from '@sveltejs/kit';

type RouteParams = { slug: string };
type RouteId = '/blog/[slug]';

// Page types
export type PageLoad = Kit.Load<RouteParams, void, App.PageData, void, RouteId>;
export type PageLoadEvent = Parameters<PageLoad>[0];
export type PageData = Kit.AwaitedProperties<Awaited<ReturnType<PageLoad>>>;

// Layout types
export type LayoutLoad = Kit.Load<RouteParams, void, App.LayoutData, void, RouteId>;
export type LayoutData = Kit.AwaitedProperties<Awaited<ReturnType<LayoutLoad>>>;

// Server types
export type PageServerLoad = Kit.ServerLoad<RouteParams, App.Platform, App.PageData, RouteId>;
export type PageServerLoadEvent = Parameters<PageServerLoad>[0];
export type Actions = Kit.Actions<RouteParams, App.Platform, RouteId>;

// Request handler types
export type RequestHandler = Kit.RequestHandler<RouteParams, App.Platform, RouteId>;
~~~

## Advanced Type Patterns

### Generic Load Functions

Create reusable load function types:

~~~ts
// src/lib/types.ts
import type { LoadEvent } from '@sveltejs/kit';

export type LoadFn<T> = (event: LoadEvent) => Promise<T>;

// Usage
export const loadUser: LoadFn<{ user: User }> = async ({ fetch }) => {
  const response = await fetch('/api/user');
  const user = await response.json();
  return { user };
};
~~~

### Type-Safe Fetch

Create typed fetch wrappers:

~~~ts
// src/lib/api.ts
import type { LoadEvent } from '@sveltejs/kit';

export async function fetchApi<T>(
  event: LoadEvent,
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await event.fetch(url, options);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// Usage
export const load = async ({ fetch }: LoadEvent) => {
  const posts = await fetchApi<Post[]>(fetch, '/api/posts');
  return { posts };
};
~~~

### Type Guards

Create type guards for runtime type checking:

~~~ts
// src/lib/guards.ts
export function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'email' in data
  );
}

// Usage
export const load = async ({ fetch }: LoadEvent) => {
  const response = await fetch('/api/user');
  const data = await response.json();

  if (!isUser(data)) {
    throw error(500, 'Invalid user data');
  }

  return { user: data };
};
~~~

## Summary

| Type | Purpose | File |
|---|---|---|
| `PageLoad` | Page load function | `+page.ts` |
| `PageData` | Page data type | `+page.svelte` |
| `PageServerLoad` | Server-only page load | `+page.server.ts` |
| `LayoutLoad` | Layout load function | `+layout.ts` |
| `LayoutData` | Layout data type | `+layout.svelte` |
| `LayoutServerLoad` | Server-only layout load | `+layout.server.ts` |
| `Actions` | Form actions | `+page.server.ts` |
| `RequestHandler` | API endpoints | `+server.ts` |
| `EntryGenerator` | Prerender entries | `+page.ts` |
| `Locals` | Request-scoped data | `app.d.ts` |
| `PageData` | Global page data | `app.d.ts` |
| `LayoutData` | Global layout data | `app.d.ts` |
| `Error` | Custom error type | `app.d.ts` |
| `Platform` | Platform-specific data | `app.d.ts` |

## Next Steps

Learn about built-in modules in [Modules](/reference/modules/).
