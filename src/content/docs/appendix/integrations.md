---
title: Integrations
description: Learn how to integrate SvelteKit with popular tools, libraries, and services
---


SvelteKit is designed to work with the broader JavaScript ecosystem. This page covers how to integrate SvelteKit with popular tools, libraries, and services for CSS, authentication, databases, CMS, analytics, and more.

## CSS Frameworks

### Tailwind CSS

Tailwind CSS is a utility-first CSS framework that works seamlessly with SvelteKit.

**Installation:**

~~~bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
~~~

**Configuration:**

~~~js
// tailwind.config.js
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {}
  },
  plugins: []
};
~~~

**Global CSS:**

~~~css
/* src/app.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
~~~

**Import in root layout:**

~~~svelte
<!-- src/routes/+layout.svelte -->
<script>
  import '../app.css';
</script>

<slot />
~~~

**Usage:**

~~~svelte
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Click me
</button>
~~~

### Bootstrap

**Installation:**

~~~bash
npm install bootstrap
~~~

**Import in root layout:**

~~~svelte
<!-- src/routes/+layout.svelte -->
<script>
  import 'bootstrap/dist/css/bootstrap.min.css';
</script>

<slot />
~~~

**Usage:**

~~~svelte
<button class="btn btn-primary">Click me</button>
~~~

### Bulma

**Installation:**

~~~bash
npm install bulma
~~~

**Import in root layout:**

~~~svelte
<!-- src/routes/+layout.svelte -->
<script>
  import 'bulma/css/bulma.min.css';
</script>

<slot />
~~~

### UnoCSS

UnoCSS is an atomic CSS engine that's faster than Tailwind and highly customizable.

**Installation:**

~~~bash
npm install -D unocss
~~~

**Configuration:**

~~~js
// uno.config.js
import { defineConfig } from 'unocss';

export default defineConfig({
  // config options
});
~~~

**Vite plugin:**

~~~js
// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import UnoCSS from 'unocss/vite';

export default {
  plugins: [UnoCSS(), sveltekit()]
};
~~~

**Import in root layout:**

~~~svelte
<!-- src/routes/+layout.svelte -->
<script>
  import 'virtual:uno.css';
</script>

<slot />
~~~

## UI Component Libraries

### Skeleton

Skeleton is a fully featured UI toolkit for building fast, accessible web apps with Svelte and Tailwind.

**Installation:**

~~~bash
npm install -D @skeletonlabs/skeleton @skeletonlabs/tw-plugin
~~~

**Documentation:** [skeleton.dev](https://skeleton.dev)

### Flowbite Svelte

Flowbite Svelte provides components built with Tailwind CSS and Svelte.

**Installation:**

~~~bash
npm install flowbite-svelte
~~~

**Usage:**

~~~svelte
<script>
  import { Button } from 'flowbite-svelte';
</script>

<Button>Click me</Button>
~~~

### Melt UI

Melt UI is a headless component library that provides accessible, unstyled components.

**Installation:**

~~~bash
npm install @melt-ui/svelte
~~~

**Usage:**

~~~svelte
<script>
  import { createDialog } from '@melt-ui/svelte';
</script>
~~~

### shadcn-svelte

A port of shadcn/ui for Svelte, providing beautiful components you can copy and paste.

**Installation:**

~~~bash
npx shadcn-svelte@latest init
~~~

**Add components:**

~~~bash
npx shadcn-svelte@latest add button
~~~

**Usage:**

~~~svelte
<script>
  import { Button } from '$lib/components/ui/button';
</script>

<Button>Click me</Button>
~~~

## Authentication

### Lucia

Lucia is a lightweight authentication library for SvelteKit.

**Installation:**

~~~bash
npm install lucia
~~~

**Setup:**

~~~js
// src/lib/server/lucia.js
import { Lucia } from 'lucia';
import { dev } from '$app/environment';

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: !dev
    }
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username
    };
  }
});
~~~

**Hooks:**

~~~js
// src/hooks.server.js
import { lucia } from '$lib/server/lucia';

export async function handle({ event, resolve }) {
  const sessionId = event.cookies.get(lucia.sessionCookieName);

  if (!sessionId) {
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }

  const { session, user } = await lucia.validateSession(sessionId);

  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes
    });
  }

  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes
    });
  }

  event.locals.user = user;
  event.locals.session = session;

  return resolve(event);
}
~~~

### Auth.js (NextAuth)

Auth.js provides authentication for SvelteKit with support for OAuth providers.

**Installation:**

~~~bash
npm install @auth/sveltekit
~~~

**Configuration:**

~~~js
// src/hooks.server.js
import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/sveltekit/providers/github';

export const { handle } = SvelteKitAuth({
  providers: [GitHub]
});
~~~

### Clerk

Clerk provides a complete authentication solution with pre-built UI components.

**Installation:**

~~~bash
npm install @clerk/sveltekit
~~~

**Configuration:**

~~~js
// src/hooks.server.js
import { clerk } from '@clerk/sveltekit/server';

export const handle = clerk({
  secretKey: process.env.CLERK_SECRET_KEY
});
~~~

## Databases

### Prisma

Prisma is a modern ORM for Node.js and TypeScript.

**Installation:**

~~~bash
npm install @prisma/client
npm install -D prisma
~~~

**Initialize:**

~~~bash
npx prisma init
~~~

**Schema:**

~~~prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
~~~

**Usage:**

~~~js
// src/lib/server/database.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getUsers() {
  return await prisma.user.findMany();
}
~~~

### Drizzle ORM

Drizzle is a lightweight, type-safe ORM for TypeScript.

**Installation:**

~~~bash
npm install drizzle-orm
npm install -D drizzle-kit
~~~

**Schema:**

~~~ts
// src/lib/server/schema.ts
import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: text('email').unique()
});
~~~

**Usage:**

~~~ts
// src/lib/server/database.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export async function getUsers() {
  return await db.select().from(schema.users);
}
~~~

### Supabase

Supabase is an open-source Firebase alternative with PostgreSQL.

**Installation:**

~~~bash
npm install @supabase/supabase-js
~~~

**Usage:**

~~~js
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
~~~

## CMS Integrations

### Contentful

**Installation:**

~~~bash
npm install contentful
~~~

**Usage:**

~~~js
// src/lib/server/contentful.js
import { createClient } from 'contentful';

export const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
});

export async function getPosts() {
  const entries = await client.getEntries({
    content_type: 'post'
  });
  return entries.items;
}
~~~

### Sanity

**Installation:**

~~~bash
npm install @sanity/client
~~~

**Usage:**

~~~js
// src/lib/sanity.js
import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: 'production',
  useCdn: true
});

export async function getPosts() {
  return await client.fetch('*[_type == "post"]');
}
~~~

### Strapi

**Usage:**

~~~js
// src/lib/server/strapi.js
export async function getPosts() {
  const response = await fetch(`${process.env.STRAPI_URL}/api/posts`, {
    headers: {
      Authorization: `Bearer ${process.env.STRAPI_TOKEN}`
    }
  });
  const data = await response.json();
  return data.data;
}
~~~

## Analytics

### Vercel Analytics

**Installation:**

~~~bash
npm install @vercel/analytics
~~~

**Usage:**

~~~svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { Analytics } from '@vercel/analytics/svelte';
</script>

<Analytics />
<slot />
~~~

### Google Analytics

**Add to app.html:**

~~~html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    %sveltekit.head%

    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID');
    </script>
  </head>
  <body>
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
~~~

### Plausible Analytics

**Add to app.html:**

~~~html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
~~~

## Form Validation

### Superforms

Superforms is a form validation library for SvelteKit with Zod support.

**Installation:**

~~~bash
npm install -D @rvf/svelte zod
~~~

**Schema:**

~~~ts
// src/lib/schemas.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
~~~

**Usage:**

~~~svelte
<script lang="ts">
  import { superForm } from '@rvf/svelte';
  import { loginSchema } from '$lib/schemas';

  let { form } = $props();

  const { form: formData, errors, message, enhance } = superForm(form, {
    validators: loginSchema
  });
</script>

<form method="POST" use:enhance>
  <input type="email" bind:value={$formData.email} />
  {#if $errors.email}
    <span class="error">{$errors.email}</span>
  {/if}

  <input type="password" bind:value={$formData.password} />
  {#if $errors.password}
    <span class="error">{$errors.password}</span>
  {/if}

  <button type="submit">Login</button>
</form>
~~~

### Zod

Zod is a TypeScript-first schema validation library.

**Installation:**

~~~bash
npm install zod
~~~

**Usage:**

~~~ts
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().int().positive()
});

const result = userSchema.safeParse({
  name: 'John',
  email: 'john@example.com',
  age: 30
});

if (result.success) {
  console.log(result.data);
} else {
  console.log(result.error);
}
~~~

## Testing

### Vitest

Vitest is a fast unit test framework powered by Vite.

**Installation:**

~~~bash
npm install -D vitest @testing-library/svelte @testing-library/jest-dom jsdom
~~~

**Configuration:**

~~~js
// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.js']
  }
});
~~~

**Setup:**

~~~js
// src/tests/setup.js
import '@testing-library/jest-dom';
~~~

**Test:**

~~~js
// src/routes/+page.test.js
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';

describe('Home page', () => {
  it('renders welcome message', () => {
    render(Page);
    expect(screen.getByText('Welcome to SvelteKit')).toBeInTheDocument();
  });
});
~~~

### Playwright

Playwright is an end-to-end testing framework.

**Installation:**

~~~bash
npm install -D @playwright/test
npx playwright install
~~~

**Test:**

~~~js
// tests/e2e/home.spec.js
import { test, expect } from '@playwright/test';

test('home page has welcome message', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Welcome to SvelteKit');
});
~~~

## Email

### Nodemailer

**Installation:**

~~~bash
npm install nodemailer
~~~

**Usage:**

~~~js
// src/lib/server/email.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendEmail(to, subject, html) {
  await transporter.sendMail({
    from: 'noreply@example.com',
    to,
    subject,
    html
  });
}
~~~

### SendGrid

**Installation:**

~~~bash
npm install @sendgrid/mail
~~~

**Usage:**

~~~js
// src/lib/server/email.js
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail(to, subject, html) {
  await sgMail.send({
    to,
    from: 'noreply@example.com',
    subject,
    html
  });
}
~~~

## Payments

### Stripe

**Installation:**

~~~bash
npm install stripe
~~~

**Usage:**

~~~js
// src/lib/server/stripe.js
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createPaymentIntent(amount, currency) {
  return await stripe.paymentIntents.create({
    amount,
    currency,
    automatic_payment_methods: { enabled: true }
  });
}
~~~

## Summary

| Category | Popular Tools |
|---|---|
| CSS | Tailwind, Bootstrap, Bulma, UnoCSS |
| UI Components | Skeleton, Flowbite, Melt UI, shadcn-svelte |
| Authentication | Lucia, Auth.js, Clerk |
| Databases | Prisma, Drizzle, Supabase |
| CMS | Contentful, Sanity, Strapi |
| Analytics | Vercel Analytics, Google Analytics, Plausible |
| Form Validation | Superforms, Zod |
| Testing | Vitest, Playwright |
| Email | Nodemailer, SendGrid |
| Payments | Stripe |

## Next Steps

Learn about migrating to SvelteKit v2 in [Migrating to SvelteKit v2](/appendix/migrating-to-v2/).
