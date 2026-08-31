---
title: Hooks
description: Intercept requests, handle errors, and customize the request lifecycle with server and client hooks
---


Hooks are functions that let you intercept and modify the request lifecycle at different stages. SvelteKit provides hooks for both server-side and client-side operations, giving you fine-grained control over authentication, logging, error handling, and request transformation.

## Server Hooks

Server hooks run on the server and are defined in `src/hooks.server.js`.

### The `handle` Hook

The `handle` function runs on every request and lets you modify the response, add headers, or perform authentication checks.

~~~js
// src/hooks.server.js
export async function handle({ event, resolve }) {
  // Run before the request is processed

  const response = await resolve(event);

  // Run after the request is processed

  return response;
}
~~~

### Authentication Example

Use `handle` to check authentication and attach user data to the event:

~~~js
// src/hooks.server.js
export async function handle({ event, resolve }) {
  // Get the session cookie
  const sessionId = event.cookies.get('session_id');

  if (sessionId) {
    // Look up the user in your database
    const user = await getUserFromSession(sessionId);

    // Attach user to the event
    event.locals.user = user;
  }

  const response = await resolve(event);

  return response;
}
~~~

Now every `load` function and server route can access `event.locals.user`.

### Type Safety

Define the `Locals` type to get TypeScript support:

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
    }
  }
}

export {};
~~~

### Adding Headers

Use `handle` to add custom headers to every response:

~~~js
// src/hooks.server.js
export async function handle({ event, resolve }) {
  const response = await resolve(event);

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}
~~~

### Request Transformation

Modify the request before it reaches your routes:

~~~js
// src/hooks.server.js
export async function handle({ event, resolve }) {
  // Redirect old URLs
  if (event.url.pathname === '/old-page') {
    return new Response(null, {
      status: 301,
      headers: { Location: '/new-page' }
    });
  }

  // Add query parameters
  if (event.url.pathname.startsWith('/api/')) {
    event.url.searchParams.set('version', 'v2');
  }

  return await resolve(event);
}
~~~

### The `handleFetch` Hook

The `handleFetch` hook lets you modify fetch requests made in `load` functions on the server:

~~~js
// src/hooks.server.js
export async function handleFetch({ event, request, fetch }) {
  // Add authentication header to internal API calls
  if (request.url.startsWith('https://api.internal.com/')) {
    request.headers.set('Authorization', `Bearer ${event.locals.apiToken}`);
  }

  return await fetch(request);
}
~~~

This is useful for:
- Adding authentication headers to internal API calls
- Modifying URLs for different environments
- Implementing custom caching strategies

### The `handleError` Hook

The `handleError` hook runs when an unexpected error occurs during request processing:

~~~js
// src/hooks.server.js
import { logErrorToService } from '$lib/utils/error-tracking';

export async function handleError({ error, event, status, message }) {
  // Log the error to an external service
  await logErrorToService({
    error,
    url: event.url.pathname,
    status,
    message
  });

  // Return a custom error object
  return {
    message: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR'
  };
}
~~~

The error object returned from `handleError` is passed to your `+error.svelte` component via `$page.error`.

## Client Hooks

Client hooks run in the browser and are defined in `src/hooks.client.js`.

### The `handleError` Hook

The client `handleError` hook runs when an error occurs during client-side navigation:

~~~js
// src/hooks.client.js
export async function handleError({ error, event, status, message }) {
  // Log to your error tracking service
  await fetch('/api/errors', {
    method: 'POST',
    body: JSON.stringify({
      error: error.message,
      url: event.url.pathname,
      status,
      timestamp: Date.now()
    })
  });

  return {
    message: 'Something went wrong',
    code: 'CLIENT_ERROR'
  };
}
~~~

### When Client Errors Occur

Client errors happen during:
- Component initialization
- Event handlers
- Client-side `load` functions
- Form actions (client-side)

## Universal Hooks

Universal hooks run on both server and client and are defined in `src/hooks.js`.

### The `reroute` Hook

The `reroute` hook lets you change which route matches a URL before it's resolved:

~~~js
// src/hooks.js
export function reroute({ url }) {
  // Redirect old URLs
  if (url.pathname === '/old-blog') {
    return '/blog';
  }

  // Handle language prefixes
  if (url.pathname.startsWith('/en/')) {
    return url.pathname.replace('/en/', '/');
  }
}
~~~

This is useful for:
- URL redirects without changing the file structure
- Handling legacy URLs
- Implementing language prefixes
- A/B testing different routes

## Sequencing Hooks

When you need multiple hooks, you can sequence them using the `sequence` helper:

~~~js
// src/hooks.server.js
import { sequence } from '@sveltejs/kit/hooks';

async function authentication({ event, resolve }) {
  const sessionId = event.cookies.get('session_id');
  if (sessionId) {
    event.locals.user = await getUserFromSession(sessionId);
  }
  return await resolve(event);
}

async function logging({ event, resolve }) {
  const start = Date.now();
  const response = await resolve(event);
  const duration = Date.now() - start;

  console.log(`${event.request.method} ${event.url.pathname} - ${response.status} (${duration}ms)`);

  return response;
}

export const handle = sequence(authentication, logging);
~~~

Hooks run in the order they're listed. Each hook can modify the event before passing it to the next hook.

## Common Patterns

### Rate Limiting

~~~js
// src/hooks.server.js
const requestCounts = new Map();

export async function handle({ event, resolve }) {
  const ip = event.getClientAddress();
  const count = requestCounts.get(ip) || 0;

  if (count > 100) {
    return new Response('Too many requests', { status: 429 });
  }

  requestCounts.set(ip, count + 1);

  // Reset after 1 minute
  setTimeout(() => {
    requestCounts.delete(ip);
  }, 60000);

  return await resolve(event);
}
~~~

### CORS Headers

~~~js
// src/hooks.server.js
export async function handle({ event, resolve }) {
  if (event.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  const response = await resolve(event);
  response.headers.set('Access-Control-Allow-Origin', '*');

  return response;
}
~~~

### Internationalization

~~~js
// src/hooks.server.js
export async function handle({ event, resolve }) {
  const lang = event.url.pathname.split('/')[1];
  event.locals.lang = ['en', 'fr', 'es'].includes(lang) ? lang : 'en';

  return await resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace('%lang%', event.locals.lang);
    }
  });
}
~~~

## Testing Hooks

You can test hooks by calling them directly:

~~~js
// tests/hooks.test.js
import { handle } from '../src/hooks.server.js';

test('handle adds security headers', async () => {
  const event = {
    url: new URL('http://localhost/test'),
    request: new Request('http://localhost/test'),
    cookies: { get: () => null },
    locals: {}
  };

  const resolve = async () => new Response('ok');

  const response = await handle({ event, resolve });

  expect(response.headers.get('X-Frame-Options')).toBe('DENY');
});
~~~

## Summary

| Hook | File | Runs On | Purpose |
|---|---|---|---|
| `handle` | `hooks.server.js` | Server | Intercept every request |
| `handleFetch` | `hooks.server.js` | Server | Modify fetch requests in load |
| `handleError` | `hooks.server.js` | Server | Handle server errors |
| `handleError` | `hooks.client.js` | Client | Handle client errors |
| `reroute` | `hooks.js` | Both | Change route matching |

## Next Steps

Learn how to handle errors gracefully with [Errors](/advanced/errors/).
