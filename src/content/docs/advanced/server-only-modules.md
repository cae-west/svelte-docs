---
title: Server-Only Modules
description: Understand the server/client boundary, protect secrets, and use server-only modules safely
---


SvelteKit runs on both the server and the client. Some code — like database queries, API keys, and file system access — should only run on the server. SvelteKit provides mechanisms to enforce this boundary and prevent sensitive code from leaking to the browser.

## The Server/Client Boundary

When a user visits your SvelteKit app:

1. **Server**: SvelteKit renders the page, runs `load` functions, and executes form actions
2. **Client**: The browser hydrates the page and handles client-side navigation

Some code is safe to run in both environments. Other code must only run on the server.

| Environment | Safe to Run |
|---|---|
| Server | Database queries, file system access, API calls with secrets, authentication |
| Client | DOM manipulation, browser APIs, user interactions, animations |
| Both | Data transformation, validation logic, utility functions |

## Server-Only Files

SvelteKit recognizes files with the `.server.js` (or `.server.ts`) extension as server-only. These files can only be imported by other server-only code.

### Creating a Server-Only Module

~~~js
// src/lib/server/database.js
import { DATABASE_URL } from '$env/static/private';

export async function getUser(id) {
  const db = await connectToDatabase(DATABASE_URL);
  return await db.users.findById(id);
}

export async function createUser(data) {
  const db = await connectToDatabase(DATABASE_URL);
  return await db.users.create(data);
}
~~~

### Importing Server-Only Modules

Server-only modules can only be imported from:
- `+page.server.js` files
- `+layout.server.js` files
- `+server.js` files (API routes)
- Other `.server.js` files
- `hooks.server.js`

~~~js
// src/routes/user/+page.server.js
import { getUser } from '$lib/server/database.js';

export async function load({ params }) {
  return {
    user: await getUser(params.id)
  };
}
~~~

### What Happens If You Import Incorrectly

If you try to import a `.server.js` file from client-side code, SvelteKit throws an error at build time:

~~~js
// src/routes/user/+page.js (client-side load)
import { getUser } from '$lib/server/database.js'; // ❌ Error!

export async function load({ params }) {
  return {
    user: await getUser(params.id) // This would expose database credentials
  };
}
~~~

This prevents accidentally bundling server code into the client.

## Environment Variables

SvelteKit provides four modules for accessing environment variables, split by when they're available (build time vs runtime) and visibility (public vs private).

### The Four `$env` Modules

| Module | When Available | Visibility | Use Case |
|---|---|---|---|
| `$env/static/public` | Build time | Client + Server | Values known at build time, safe to expose |
| `$env/static/private` | Build time | Server only | Secrets known at build time |
| `$env/dynamic/public` | Runtime | Client + Server | Public values that may change |
| `$env/dynamic/private` | Runtime | Server only | Secrets that may change |

### Static Public Variables

Import values that are known at build time and safe to expose:

~~~js
// src/lib/config.js
import { PUBLIC_API_URL } from '$env/static/public';

export const apiUrl = PUBLIC_API_URL;
~~~

These variables must be prefixed with `PUBLIC_` (configurable) to make it clear they're safe to expose.

### Static Private Variables

Import secrets that are known at build time:

~~~js
// src/lib/server/stripe.js
import { STRIPE_SECRET_KEY } from '$env/static/private';
import Stripe from 'stripe';

export const stripe = new Stripe(STRIPE_SECRET_KEY);
~~~

These can only be imported from server-only code.

### Dynamic Public Variables

Import values that may change at runtime:

~~~js
// src/lib/config.js
import { env } from '$env/dynamic/public';

export const apiUrl = env.PUBLIC_API_URL;
~~~

Useful for values that change between environments without rebuilding.

### Dynamic Private Variables

Import secrets that may change at runtime:

~~~js
// src/lib/server/database.js
import { env } from '$env/dynamic/private';

export async function connect() {
  return await connectToDatabase(env.DATABASE_URL);
}
~~~

### Configuring the Public Prefix

By default, public variables must be prefixed with `PUBLIC_`. Change this in `svelte.config.js`:

~~~js
export default {
  kit: {
    envPrefix: 'MY_APP_'
  }
};
~~~

Now public variables must be prefixed with `MY_APP_`.

## Protecting Secrets

### Never Expose Secrets to the Client

Secrets should never be accessible in client-side code. SvelteKit enforces this through:

1. **File naming** — `.server.js` files can't be imported by client code
2. **Module restrictions** — `$env/static/private` and `$env/dynamic/private` can only be imported server-side
3. **Build-time checks** — SvelteKit verifies that private modules aren't bundled for the client

### Example: Secure API Route

~~~js
// src/routes/api/payment/+server.js
import { json } from '@sveltejs/kit';
import { STRIPE_SECRET_KEY } from '$env/static/private';
import Stripe from 'stripe';

const stripe = new Stripe(STRIPE_SECRET_KEY);

export async function POST({ request }) {
  const { amount, currency } = await request.json();

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    automatic_payment_methods: { enabled: true }
  });

  return json({ clientSecret: paymentIntent.client_secret });
}
~~~

The `STRIPE_SECRET_KEY` is only accessible on the server. The client receives only the `clientSecret`, which is safe to expose.

### Example: Database Access

~~~js
// src/lib/server/database.js
import { DATABASE_URL } from '$env/static/private';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: DATABASE_URL });

export async function query(text, params) {
  const result = await pool.query(text, params);
  return result.rows;
}
~~~

~~~js
// src/routes/products/+page.server.js
import { query } from '$lib/server/database.js';

export async function load() {
  const products = await query('SELECT * FROM products');
  return { products };
}
~~~

The database connection is only created on the server.

## Common Patterns

### Authentication Helper

~~~js
// src/lib/server/auth.js
import { redirect } from '@sveltejs/kit';
import { SESSION_SECRET } from '$env/static/private';
import jwt from 'jsonwebtoken';

export function getUser(event) {
  const token = event.cookies.get('session');

  if (!token) {
    throw redirect(303, '/login');
  }

  try {
    return jwt.verify(token, SESSION_SECRET);
  } catch {
    throw redirect(303, '/login');
  }
}
~~~

~~~js
// src/routes/dashboard/+page.server.js
import { getUser } from '$lib/server/auth.js';

export async function load(event) {
  const user = getUser(event);
  return { user };
}
~~~

### Email Service

~~~js
// src/lib/server/email.js
import { SENDGRID_API_KEY } from '$env/static/private';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(SENDGRID_API_KEY);

export async function sendEmail(to, subject, html) {
  await sgMail.send({
    to,
    from: 'noreply@example.com',
    subject,
    html
  });
}
~~~

~~~js
// src/routes/contact/+page.server.js
import { sendEmail } from '$lib/server/email.js';

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email');
    const message = data.get('message');

    await sendEmail('admin@example.com', 'Contact Form', message);

    return { success: true };
  }
};
~~~

### File Upload

~~~js
// src/routes/upload/+page.server.js
import { fail } from '@sveltejs/kit';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const actions = {
  upload: async ({ request }) => {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return fail(400, { error: 'No file provided' });
    }

    const uploadDir = './uploads';
    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return { success: true, filename: file.name };
  }
};
~~~

File system access is server-only.

## Testing Server-Only Modules

When testing server-only modules, you need to mock environment variables:

~~~js
// tests/database.test.js
import { describe, it, expect, vi } from 'vitest';

// Mock environment variables
vi.mock('$env/static/private', () => ({
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test'
}));

describe('database', () => {
  it('connects to the database', async () => {
    const { query } = await import('$lib/server/database.js');
    const result = await query('SELECT 1');
    expect(result).toBeDefined();
  });
});
~~~

## Security Best Practices

### 1. Never Log Secrets

~~~js
// ❌ Bad
console.log('Database URL:', DATABASE_URL);

// ✅ Good
console.log('Connected to database');
~~~

### 2. Validate User Input

~~~js
// src/routes/api/users/+server.js
import { json, error } from '@sveltejs/kit';
import { query } from '$lib/server/database.js';

export async function POST({ request }) {
  const data = await request.json();

  // Validate input
  if (!data.email || !data.email.includes('@')) {
    throw error(400, 'Invalid email');
  }

  // Use parameterized queries to prevent SQL injection
  const user = await query(
    'INSERT INTO users (email) VALUES ($1) RETURNING *',
    [data.email]
  );

  return json(user);
}
~~~

### 3. Use HTTPS in Production

Always use HTTPS in production to encrypt data in transit. Configure your server or reverse proxy to redirect HTTP to HTTPS.

### 4. Rotate Secrets Regularly

Use dynamic environment variables (`$env/dynamic/private`) for secrets that need to be rotated without redeploying.

### 5. Limit Secret Scope

Only expose secrets to the modules that need them:

~~~js
// ❌ Bad - exposes all secrets
import { env } from '$env/dynamic/private';
export const stripeKey = env.STRIPE_SECRET_KEY;
export const dbUrl = env.DATABASE_URL;

// ✅ Good - each module gets only what it needs
// src/lib/server/stripe.js
import { STRIPE_SECRET_KEY } from '$env/static/private';
export const stripe = new Stripe(STRIPE_SECRET_KEY);

// src/lib/server/database.js
import { DATABASE_URL } from '$env/static/private';
export const pool = new Pool({ connectionString: DATABASE_URL });
~~~

## Summary

| Concept | Purpose |
|---|---|
| `.server.js` files | Mark modules as server-only |
| `$env/static/public` | Build-time public variables |
| `$env/static/private` | Build-time private variables |
| `$env/dynamic/public` | Runtime public variables |
| `$env/dynamic/private` | Runtime private variables |
| `PUBLIC_` prefix | Mark variables as safe to expose |

## Next Steps

Find answers to common questions in the [FAQ](/appendix/frequently-asked-questions/).