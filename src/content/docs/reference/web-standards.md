---
title: Web Standards
description: Reference for standard Web APIs used throughout SvelteKit
---


SvelteKit is built on standard Web APIs rather than proprietary abstractions. This page documents the Web APIs you'll use most frequently when working with SvelteKit, including Request, Response, Headers, URL, fetch, and FormData.

## Request

The `Request` object represents an HTTP request.

### Creating a Request

~~~js
const request = new Request('https://api.example.com/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ title: 'Hello World' })
});
~~~

### Request Properties

**`method`** — HTTP method (GET, POST, PUT, DELETE, etc.)

~~~js
if (request.method === 'POST') {
  // Handle POST request
}
~~~

**`url`** — The request URL

~~~js
const url = new URL(request.url);
const postId = url.searchParams.get('id');
~~~

**`headers`** — Request headers

~~~js
const contentType = request.headers.get('Content-Type');
const auth = request.headers.get('Authorization');
~~~

**`body`** — Request body (for POST, PUT, PATCH)

~~~js
// Read as text
const text = await request.text();

// Read as JSON
const data = await request.json();

// Read as FormData
const formData = await request.formData();

// Read as ArrayBuffer
const buffer = await request.arrayBuffer();

// Read as Blob
const blob = await request.blob();
~~~

### Using Request in Endpoints

~~~js
// src/routes/api/posts/+server.js
export async function POST({ request }) {
  const data = await request.json();

  const post = await createPost(data);

  return new Response(JSON.stringify(post), {
    status: 201,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
~~~

## Response

The `Response` object represents an HTTP response.

### Creating a Response

~~~js
// Simple text response
const response = new Response('Hello World');

// JSON response
const response = new Response(JSON.stringify({ message: 'Success' }), {
  headers: {
    'Content-Type': 'application/json'
  }
});

// HTML response
const response = new Response('<h1>Hello</h1>', {
  headers: {
    'Content-Type': 'text/html'
  }
});

// Redirect response
const response = Response.redirect('/login', 302);
~~~

### Response Properties

**`status`** — HTTP status code

~~~js
if (response.status === 200) {
  console.log('Success');
}
~~`

**`statusText`** — Status message

~~~js
console.log(response.statusText); // "OK", "Not Found", etc.
~~~

**`headers`** — Response headers

~~~js
const contentType = response.headers.get('Content-Type');
~~~

**`ok`** — Whether status is in the 200-299 range

~~~js
if (response.ok) {
  const data = await response.json();
}
~~~

### Response Methods

**`json()`** — Parse response as JSON

~~~js
const data = await response.json();
~~~

**`text()`** — Read response as text

~~~js
const text = await response.text();
~~~

**`blob()`** — Read response as Blob

~~~js
const blob = await response.blob();
const url = URL.createObjectURL(blob);
~~~

**`arrayBuffer()`** — Read response as ArrayBuffer

~~~js
const buffer = await response.arrayBuffer();
~~~

### Using Response in Endpoints

~~~js
// src/routes/api/data/+server.js
export async function GET() {
  const data = { message: 'Hello' };

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'max-age=3600'
    }
  });
}
~~~

### Helper Functions

SvelteKit provides helper functions for common response types:

**`json()`** — Create a JSON response

~~~js
import { json } from '@sveltejs/kit';

export async function GET() {
  return json({ message: 'Hello' });
}
~~~

**`text()`** — Create a text response

~~~js
import { text } from '@sveltejs/kit';

export async function GET() {
  return text('Hello World');
}
~~~

**`redirect()`** — Create a redirect response

~~~js
import { redirect } from '@sveltejs/kit';

export async function GET() {
  throw redirect(302, '/login');
}
~~~

**`error()`** — Create an error response

~~~js
import { error } from '@sveltejs/kit';

export async function GET() {
  throw error(404, 'Not found');
}
~~~

## Headers

The `Headers` object represents HTTP headers.

### Creating Headers

~~~js
const headers = new Headers();
headers.set('Content-Type', 'application/json');
headers.set('Authorization', 'Bearer token123');
~~~

### Headers Methods

**`get(name)`** — Get a header value

~~~js
const contentType = headers.get('Content-Type');
~~~

**`set(name, value)`** — Set a header value

~~~js
headers.set('X-Custom-Header', 'value');
~~~

**`append(name, value)`** — Append to a header (for multiple values)

~~~js
headers.append('Set-Cookie', 'session=abc');
headers.append('Set-Cookie', 'theme=dark');
~~~

**`has(name)`** — Check if header exists

~~~js
if (headers.has('Authorization')) {
  // Has authorization header
}
~~~

**`delete(name)`** — Delete a header

~~~js
headers.delete('X-Custom-Header');
~~~

**`entries()`** — Iterate over all headers

~~~js
for (const [name, value] of headers.entries()) {
  console.log(`${name}: ${value}`);
}
~~~

### Using Headers in Endpoints

~~~js
export async function GET({ request }) {
  // Read request headers
  const auth = request.headers.get('Authorization');

  // Set response headers
  return new Response('ok', {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'max-age=3600',
      'X-Custom-Header': 'value'
    }
  });
}
~~~

## URL

The `URL` object represents a URL and provides methods for parsing and manipulating it.

### Creating a URL

~~~js
const url = new URL('https://example.com/path?query=value#hash');
~~~

### URL Properties

**`protocol`** — Protocol (http:, https:, etc.)

~~~js
console.log(url.protocol); // "https:"
~~~

**`host`** — Host with port

~~~js
console.log(url.host); // "example.com:8080"
~~~

**`hostname`** — Host without port

~~~js
console.log(url.hostname); // "example.com"
~~~

**`port`** — Port number

~~~js
console.log(url.port); // "8080"
~~~

**`pathname`** — Path

~~~js
console.log(url.pathname); // "/path"
~~~

**`search`** — Query string

~~~js
console.log(url.search); // "?query=value"
~~~

**`searchParams`** — URLSearchParams object

~~~js
const query = url.searchParams.get('query');
url.searchParams.set('page', '2');
~~~

**`hash`** — Fragment identifier

~~~js
console.log(url.hash); // "#hash"
~~~

### Using URL in Load Functions

~~~js
// src/routes/search/+page.js
export async function load({ url }) {
  const query = url.searchParams.get('q');
  const page = parseInt(url.searchParams.get('page') || '1');

  const results = await search(query, page);

  return { results, query, page };
}
~~~

### Using URL in Endpoints

~~~js
// src/routes/api/data/+server.js
export async function GET({ url }) {
  const id = url.searchParams.get('id');

  const data = await getData(id);

  return Response.json(data);
}
~~~

## URLSearchParams

The `URLSearchParams` object provides utilities for working with query strings.

### Creating URLSearchParams

~~~js
const params = new URLSearchParams();
params.set('page', '1');
params.set('limit', '10');
~~~

Or from a query string:

~~~js
const params = new URLSearchParams('?page=1&limit=10');
~~~

### URLSearchParams Methods

**`get(name)`** — Get a parameter value

~~~js
const page = params.get('page');
~~~

**`set(name, value)`** — Set a parameter value

~~~js
params.set('page', '2');
~~~

**`append(name, value)`** — Append a parameter value

~~~js
params.append('tag', 'javascript');
params.append('tag', 'svelte');
~~~

**`has(name)`** — Check if parameter exists

~~~js
if (params.has('page')) {
  // Has page parameter
}
~~~

**`delete(name)`** — Delete a parameter

~~~js
params.delete('page');
~~~

**`toString()`** — Convert to query string

~~~js
const queryString = params.toString(); // "page=1&limit=10"
~~~

**`entries()`** — Iterate over all parameters

~~~js
for (const [name, value] of params.entries()) {
  console.log(`${name}: ${value}`);
}
~~~

## fetch

The `fetch` function makes HTTP requests.

### Basic Usage

~~~js
const response = await fetch('https://api.example.com/posts');
const data = await response.json();
~~~

### Request Options

~~~js
const response = await fetch('https://api.example.com/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  body: JSON.stringify({
    title: 'Hello World',
    content: 'This is a post'
  })
});
~~~

### Using fetch in Load Functions

~~~js
// src/routes/posts/+page.js
export async function load({ fetch }) {
  const response = await fetch('/api/posts');
  const posts = await response.json();

  return { posts };
}
~~~

**Important:** Use the `fetch` function provided to load functions, not the global `fetch`. This ensures:
- Cookies are automatically included
- Relative URLs work correctly
- Requests are properly tracked for invalidation

### Using fetch in Endpoints

~~~js
// src/routes/api/proxy/+server.js
export async function GET() {
  const response = await fetch('https://api.example.com/data');
  const data = await response.json();

  return Response.json(data);
}
~~~

### Error Handling

~~~js
async function fetchData() {
  try {
    const response = await fetch('/api/data');

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
  }
}
~~~

## FormData

The `FormData` object represents form data.

### Creating FormData

~~~js
const formData = new FormData();
formData.append('email', 'user@example.com');
formData.append('password', 'secret');
~~~

### Reading FormData

~~~js
const email = formData.get('email');
const password = formData.get('password');
~~~

### Using FormData in Form Actions

~~~js
// src/routes/login/+page.server.js
export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');

    // Validate and authenticate
    if (!email || !password) {
      return fail(400, { error: 'Missing fields' });
    }

    const user = await authenticate(email, password);

    if (!user) {
      return fail(401, { error: 'Invalid credentials' });
    }

    return { success: true };
  }
};
~~~

### Using FormData with fetch

~~~js
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
~~~

## Cookies

The `Cookies` API manages HTTP cookies in SvelteKit.

### Reading Cookies

~~~js
// src/hooks.server.js
export async function handle({ event, resolve }) {
  const session = event.cookies.get('session');

  if (session) {
    event.locals.user = await validateSession(session);
  }

  return await resolve(event);
}
~~~

### Setting Cookies

~~~js
// src/routes/login/+page.server.js
export const actions = {
  default: async ({ cookies, request }) => {
    const formData = await request.formData();
    const email = formData.get('email');

    const user = await authenticate(email);

    cookies.set('session', user.sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return { success: true };
  }
};
~~~

### Deleting Cookies

~~~js
// src/routes/logout/+page.server.js
export const actions = {
  default: async ({ cookies }) => {
    cookies.delete('session', { path: '/' });

    return { success: true };
  }
};
~~~

### Cookie Options

**`path`** — Cookie path (required for deletion)

**`domain`** — Cookie domain

**`httpOnly`** — Not accessible via JavaScript

**`secure`** — Only sent over HTTPS

**`sameSite`** — CSRF protection ('strict', 'lax', 'none')

**`maxAge`** — Lifetime in seconds

**`expires`** — Expiration date

## Common Patterns

### JSON API Endpoint

~~~js
// src/routes/api/posts/+server.js
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');

  const posts = await getPosts(page, limit);

  return json({
    posts,
    page,
    limit,
    total: await countPosts()
  });
}

export async function POST({ request }) {
  const data = await request.json();

  const post = await createPost(data);

  return json(post, { status: 201 });
}
~~~

### Authentication Middleware

~~~js
// src/hooks.server.js
import { redirect } from '@sveltejs/kit';

export async function handle({ event, resolve }) {
  const session = event.cookies.get('session');

  if (session) {
    event.locals.user = await validateSession(session);
  }

  // Protect routes
  if (event.url.pathname.startsWith('/admin') && !event.locals.user) {
    throw redirect(302, '/login');
  }

  return await resolve(event);
}
~~~

### File Upload

~~~js
// src/routes/upload/+page.server.js
import { fail } from '@sveltejs/kit';
import { writeFile } from 'fs/promises';

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || file.size === 0) {
      return fail(400, { error: 'No file provided' });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(`uploads/${file.name}`, buffer);

    return { success: true, filename: file.name };
  }
};
~~~

### Streaming Response

~~~js
// src/routes/api/stream/+server.js
export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 10; i++) {
        controller.enqueue(`Data chunk ${i}\n`);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}
~~~

## Summary

| API | Purpose | Common Usage |
|---|---|---|
| `Request` | HTTP request | Reading request data in endpoints |
| `Response` | HTTP response | Returning data from endpoints |
| `Headers` | HTTP headers | Setting/getting headers |
| `URL` | URL parsing | Working with URLs and query params |
| `URLSearchParams` | Query strings | Managing query parameters |
| `fetch` | HTTP requests | Making API calls |
| `FormData` | Form data | Handling form submissions |
| `Cookies` | HTTP cookies | Session management |
