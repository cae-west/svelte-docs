---
title: Frequently Asked Questions
description: Find answers to common questions about SvelteKit development, deployment, and troubleshooting
---

# Frequently Asked Questions

This page addresses the most common questions developers ask about SvelteKit. If your question isn't covered here, check the [official documentation](https://svelte.dev/docs/kit) or ask in the [Svelte Discord](https://svelte.dev/chat).

## Getting Started

### What is SvelteKit?

SvelteKit is a framework for building web applications with Svelte. It provides routing, server-side rendering, build optimization, and deployment tools. Think of it as the Svelte equivalent of Next.js for React or Nuxt for Vue.

### Do I need to know Svelte before using SvelteKit?

Yes. SvelteKit is built on top of Svelte, so you should understand Svelte basics first:
- Components and props
- Reactivity with `$state` and `$derived`
- Event handling
- Lifecycle functions

Start with the [Svelte tutorial](https://svelte.dev/tutorial) if you're new to Svelte.

### What's the difference between Svelte and SvelteKit?

**Svelte** is a UI framework that compiles components to efficient JavaScript. **SvelteKit** is an application framework built on Svelte that adds:
- File-based routing
- Server-side rendering
- Build and deployment tools
- Data loading and form actions
- Adapters for different hosting platforms

You can use Svelte without SvelteKit for simple components or libraries. Use SvelteKit when building full applications.

### What version of Node.js do I need?

SvelteKit requires Node.js 18.13 or later. We recommend using the latest LTS version (currently Node.js 20).

Check your version:

~~~bash
node --version
~~~

If you need to upgrade, use [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager):

~~~bash
nvm install 20
nvm use 20
~~~

## Project Setup

### How do I create a new SvelteKit project?

Use the `create-svelte` CLI:

~~~bash
npm create svelte@latest my-app
cd my-app
npm install
npm run dev
~~~

The CLI will ask you to choose:
- A template (skeleton, library, or demo)
- Whether to use TypeScript
- Additional features (Prettier, ESLint, Playwright, etc.)

### Can I use JavaScript instead of TypeScript?

Yes. SvelteKit works with both JavaScript and TypeScript. When creating a project, choose "No" when asked about TypeScript, or manually rename `.ts` files to `.js`.

However, TypeScript provides better developer experience with type checking and autocompletion. We recommend it for larger projects.

### How do I add CSS frameworks like Tailwind or Bootstrap?

Install the framework and configure it in your project:

**Tailwind CSS:**

~~~bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
~~~

Update `tailwind.config.js`:

~~~js
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: { extend: {} },
  plugins: []
};
~~~

Add to your global CSS:

~~~css
/* src/app.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
~~~

Import in your root layout:

~~~svelte
<!-- src/routes/+layout.svelte -->
<script>
  import '../app.css';
</script>

<slot />
~~~

### How do I add authentication?

SvelteKit doesn't include built-in authentication, but you can integrate any authentication system:

**Option 1: Use a library like Lucia**

~~~bash
npm install lucia
~~~

Follow the [Lucia documentation](https://lucia-auth.com/) for setup.

**Option 2: Use a third-party service**

- Auth0
- Firebase Authentication
- Supabase Auth
- Clerk

**Option 3: Build your own**

Use the `handle` hook to check sessions:

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

## Routing

### How do I create dynamic routes?

Use square brackets in your directory names:

~~~
src/routes/blog/[slug]/+page.svelte
~~~

Access the parameter in your load function:

~~~js
// src/routes/blog/[slug]/+page.js
export function load({ params }) {
  return {
    slug: params.slug
  };
}
~~~

### How do I handle optional parameters?

Use double brackets:

~~~
src/routes/[[lang]]/home/+page.svelte
~~~

Both `/home` and `/en/home` will match.

### How do I create catch-all routes?

Use rest parameters:

~~~
src/routes/[...path]/+page.svelte
~~~

This matches any path: `/foo`, `/foo/bar`, `/foo/bar/baz`.

### How do I redirect users?

Use the `redirect` function in load functions or form actions:

~~~js
// src/routes/old-page/+page.js
import { redirect } from '@sveltejs/kit';

export function load() {
  throw redirect(301, '/new-page');
}
~~~

Status codes:
- `301` — Permanent redirect (cached by browsers)
- `302` — Temporary redirect
- `303` — See other (use after form submission)
- `307` — Temporary redirect (preserves method)
- `308` — Permanent redirect (preserves method)

### How do I create a 404 page?

Create a `+error.svelte` component in your routes directory:

~~~svelte
<!-- src/routes/+error.svelte -->
<script>
  import { page } from '$app/stores';
</script>

<h1>{$page.status}</h1>
<p>{$page.error.message}</p>
<a href="/">Go home</a>
~~~

## Data Loading

### What's the difference between `+page.js` and `+page.server.js`?

**`+page.js`** — Universal load function that runs on both server and client:
- Can access `fetch`
- Runs during server-side rendering and client-side navigation
- Should not access server-only resources (database, secrets)

**`+page.server.js`** — Server-only load function:
- Only runs on the server
- Can access databases, file system, secrets
- Has access to `cookies`, `locals`, and other server-only properties

Use `+page.server.js` when you need server-only resources. Use `+page.js` for data that can be fetched from public APIs.

### How do I fetch data from an API?

Use the `fetch` function provided to load functions:

~~~js
// src/routes/posts/+page.js
export async function load({ fetch }) {
  const response = await fetch('/api/posts');
  const posts = await response.json();
  return { posts };
}
~~~

For external APIs:

~~~js
export async function load({ fetch }) {
  const response = await fetch('https://api.example.com/posts');
  const posts = await response.json();
  return { posts };
}
~~~

### How do I access URL parameters in a load function?

Parameters are available in the `params` object:

~~~js
// src/routes/blog/[slug]/+page.js
export function load({ params }) {
  return {
    slug: params.slug
  };
}
~~~

### How do I share data between pages?

Use layout files to share data across multiple pages:

~~~js
// src/routes/+layout.js
export async function load({ fetch }) {
  const response = await fetch('/api/user');
  const user = await response.json();
  return { user };
}
~~~

Every page can now access `data.user`.

### How do I invalidate data and refetch?

Use the `invalidate` function:

~~~svelte
<script>
  import { invalidate } from '$app/navigation';

  async function refreshData() {
    await invalidate('/api/posts');
  }
</script>

<button onclick={refreshData}>Refresh</button>
~~~

Or use `invalidateAll` to refetch everything:

~~~js
import { invalidateAll } from '$app/navigation';

await invalidateAll();
~~~

## Form Actions

### How do I handle form submissions?

Create a form action in `+page.server.js`:

~~~js
// src/routes/login/+page.server.js
export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');

    // Validate and authenticate
    // ...

    return { success: true };
  }
};
~~~

Create a form in your page:

~~~svelte
<form method="POST">
  <input type="email" name="email" />
  <input type="password" name="password" />
  <button type="submit">Log in</button>
</form>
~~~

### How do I handle multiple form actions on one page?

Name your actions:

~~~js
export const actions = {
  login: async ({ request }) => { /* ... */ },
  register: async ({ request }) => { /* ... */ }
};
~~~

Specify the action in your form:

~~~svelte
<form method="POST" action="?/login">
  <!-- login form -->
</form>

<form method="POST" action="?/register">
  <!-- register form -->
</form>
~~~

### How do I return validation errors?

Use the `fail` function:

~~~js
import { fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email');

    if (!email) {
      return fail(400, { email, error: 'Email is required' });
    }

    return { success: true };
  }
};
~~~

Access errors in your component:

~~~svelte
<script>
  let { form } = $props();
</script>

{#if form?.error}
  <p class="error">{form.error}</p>
{/if}
~~~

## Deployment

### How do I deploy my SvelteKit app?

1. Install an adapter for your platform:

~~~bash
npm install -D @sveltejs/adapter-vercel  # or adapter-netlify, adapter-node, etc.
~~~

2. Configure it in `svelte.config.js`:

~~~js
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter()
  }
};
~~~

3. Build and deploy:

~~~bash
npm run build
~~~

### Which adapter should I use?

- **Vercel** → `@sveltejs/adapter-vercel`
- **Netlify** → `@sveltejs/adapter-netlify`
- **Cloudflare Pages** → `@sveltejs/adapter-cloudflare`
- **Node.js server** → `@sveltejs/adapter-node`
- **Static hosting** → `@sveltejs/adapter-static`
- **Not sure** → `@sveltejs/adapter-auto` (auto-detects platform)

### How do I deploy to a subdirectory?

Set the `base` path in `svelte.config.js`:

~~~js
export default {
  kit: {
    paths: {
      base: '/my-app'
    }
  }
};
~~~

### How do I set environment variables?

Use the `$env` modules:

~~~js
import { PUBLIC_API_URL } from '$env/static/public';
import { DATABASE_URL } from '$env/static/private';
~~~

Set them in your hosting platform's dashboard or in a `.env` file for local development.

## Performance

### How do I optimize my SvelteKit app for performance?

1. **Enable preloading** — Links preload data by default
2. **Use code splitting** — SvelteKit does this automatically
3. **Optimize images** — Use modern formats (WebP, AVIF)
4. **Minimize JavaScript** — Remove unused dependencies
5. **Enable compression** — Use `precompress: true` in your adapter
6. **Use a CDN** — Serve static assets from a CDN

### How do I reduce bundle size?

- Use dynamic imports for large components
- Remove unused dependencies
- Use tree-shaking (SvelteKit does this automatically)
- Analyze your bundle with `vite-bundle-visualizer`:

~~~bash
npm install -D vite-bundle-visualizer
npx vite-bundle-visualizer
~~~

### How do I implement lazy loading?

Use dynamic imports:

~~~svelte
<script>
  import { onMount } from 'svelte';

  let HeavyComponent;

  onMount(async () => {
    const module = await import('./HeavyComponent.svelte');
    HeavyComponent = module.default;
  });
</script>

{#if HeavyComponent}
  <HeavyComponent />
{:else}
  <p>Loading...</p>
{/if}
~~~

## Common Errors

### "Cannot find module" error

This usually means you're importing a server-only module from client code. Check that:
- You're not importing `.server.js` files from `+page.js` or components
- You're not importing `$env/static/private` from client code

### "Unexpected token" error

This often indicates a syntax error. Check:
- Missing commas or semicolons
- Unclosed brackets or quotes
- TypeScript type errors

Run `npm run check` to see all TypeScript errors.

### "404 Not Found" on a route that exists

This can happen if:
- The route has a typo in the directory name
- The route requires a parameter you didn't provide
- The route is in a route group that's not being matched

Check your file structure and route parameters.

### "CSRF protection" error

This happens when the `Origin` header doesn't match your expected origin. Set the `ORIGIN` environment variable:

~~~bash
ORIGIN=https://example.com node build
~~~

### "Module not found: Can't resolve $app/..." error

This means you're trying to use SvelteKit modules outside of a SvelteKit context. Make sure:
- You're running the app with `npm run dev` or `npm run build`
- You're not importing SvelteKit modules in a plain Svelte project

## TypeScript

### Do I need to use TypeScript?

No, but it's recommended. TypeScript provides:
- Type checking
- Better autocompletion
- Refactoring tools
- Catching errors at compile time

You can use JavaScript for small projects and TypeScript for larger ones.

### How do I type my load function return values?

Define an interface for your data:

~~~ts
// src/routes/blog/[slug]/+page.ts
import type { PageLoad } from './$types';

interface Post {
  title: string;
  content: string;
}

export const load: PageLoad = async ({ params }) => {
  const post: Post = await getPost(params.slug);
  return { post };
};
~~~

### How do I type form actions?

Use the `Action` type:

~~~ts
// src/routes/login/+page.server.ts
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    // ...
  }
};
~~~

### How do I type event.locals?

Extend the `Locals` interface in `src/app.d.ts`:

~~~ts
// src/app.d.ts
declare global {
  namespace App {
    interface Locals {
      user?: {
        id: string;
        name: string;
      };
    }
  }
}

export {};
~~~

## Testing

### How do I test my SvelteKit app?

Use a testing framework like Vitest:

~~~bash
npm install -D vitest @testing-library/svelte
~~~

Create a test:

~~~js
// src/routes/+page.test.js
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Page from './+page.svelte';

describe('Home page', () => {
  it('renders welcome message', () => {
    const { getByText } = render(Page);
    expect(getByText('Welcome to SvelteKit')).toBeInTheDocument();
  });
});
~~~

### How do I test load functions?

Call them directly with mock data:

~~~js
// src/routes/blog/[slug]/+page.test.js
import { describe, it, expect } from 'vitest';
import { load } from './+page.js';

describe('blog post load function', () => {
  it('returns post data', async () => {
    const result = await load({
      params: { slug: 'test-post' },
      fetch: async () => new Response(JSON.stringify({ title: 'Test' }))
    });

    expect(result.post.title).toBe('Test');
  });
});
~~~

## Miscellaneous

### Can I use SvelteKit with a CMS?

Yes. You can fetch data from any CMS in your load functions:

~~~js
export async function load({ fetch }) {
  const response = await fetch('https://cms.example.com/api/posts');
  const posts = await response.json();
  return { posts };
}
~~~

Popular CMS integrations:
- Contentful
- Sanity
- Strapi
- WordPress (via REST API or GraphQL)

### Can I use SvelteKit for a static site?

Yes. Use `adapter-static` and enable prerendering:

~~~js
// svelte.config.js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter()
  }
};
~~~

~~~js
// src/routes/+layout.js
export const prerender = true;
~~~

### Can I use SvelteKit for a single-page app?

Yes. Use `adapter-static` with a fallback page:

~~~js
// svelte.config.js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      fallback: '404.html'
    })
  }
};
~~~

~~~js
// src/routes/+layout.js
export const ssr = false;
export const prerender = false;
~~~

### How do I add internationalization (i18n)?

Use optional parameters for language prefixes:

~~~
src/routes/[[lang]]/
├ +layout.js
├ about/
└ contact/
~~~

~~~js
// src/routes/[[lang]]/+layout.js
export function load({ params }) {
  return {
    lang: params.lang || 'en'
  };
}
~~~

Use a library like `svelte-i18n` for translations.

### How do I add analytics?

Add your analytics script to `app.html`:

~~~html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    %sveltekit.head%
  </head>
  <body>
    <div style="display: contents">%sveltekit.body%</div>

    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID');
    </script>
  </body>
</html>
~~~

Or use a SvelteKit-specific library like `@vercel/analytics` or `@sveltejs/kit-analytics`.

## Still Have Questions?

- Check the [official documentation](https://svelte.dev/docs/kit)
- Search [GitHub issues](https://github.com/sveltejs/kit/issues)
- Ask in the [Svelte Discord](https://svelte.dev/chat)
- Post on [Stack Overflow](https://stackoverflow.com/questions/tagged/sveltekit) with the `sveltekit` tag

## Next Steps

Learn about integrating SvelteKit with other tools and frameworks in [Integrations](/appendix/integrations/).
