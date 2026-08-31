---
title: Static Site Generation
description: Build fully static sites with SvelteKit using adapter-static and prerendering
---


SvelteKit can generate fully static HTML sites that can be hosted anywhere — GitHub Pages, Netlify, Cloudflare Pages, or even a plain web server. Static sites are fast, cheap to host, and work without a server.

## Installing the Static Adapter

First, install `adapter-static`:

~~~bash
npm install -D @sveltejs/adapter-static
~~~

Then configure it in `svelte.config.js`:

~~~js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter()
  }
};
~~~

## How It Works

When you run `npm run build`, the static adapter:

1. Crawls your app starting from the root route
2. Renders each page to static HTML
3. Copies static assets to the output directory
4. Produces a folder of plain HTML, CSS, and JavaScript files

The output can be uploaded to any static file host.

## Prerendering Requirements

For `adapter-static` to work, every page must be prerendered. You have two options:

### Option 1: Prerender Everything

Set `prerender = true` in your root layout:

~~~js
// src/routes/+layout.js
export const prerender = true;
~~~

This applies to every page in your app.

### Option 2: Prerender Specific Routes

Set prerendering per route:

~~~js
// src/routes/about/+page.js
export const prerender = true;
~~~

Or configure entries in the root layout:

~~~js
// src/routes/+layout.js
export const prerender = true;
export const entries = ['/', '/about', '/blog', '/blog/first-post'];
~~~

## Dynamic Routes

For dynamic routes like `/blog/[slug]`, you need to tell SvelteKit which pages to prerender using the `entries` function:

~~~js
// src/routes/blog/[slug]/+page.js
export const prerender = true;

export function entries() {
  return [
    { slug: 'first-post' },
    { slug: 'second-post' },
    { slug: 'third-post' }
  ];
}
~~~

The `entries` function returns an array of objects matching the route parameters. SvelteKit will prerender each one.

### Fetching Entries Dynamically

You can fetch entries from an API or database:

~~~js
// src/routes/blog/[slug]/+page.js
export const prerender = true;

export async function entries() {
  const response = await fetch('https://api.example.com/posts');
  const posts = await response.json();

  return posts.map(post => ({ slug: post.slug }));
}
~~~

## Configuration Options

The static adapter accepts several options:

~~~js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: null,
      precompress: false,
      strict: true
    })
  }
};
~~~

| Option | Default | Description |
|---|---|---|
| `pages` | `'build'` | Directory for prerendered HTML pages |
| `assets` | `'build'` | Directory for static assets |
| `fallback` | `null` | Fallback page for SPA mode |
| `precompress` | `false` | Pre-compress assets with gzip and brotli |
| `strict` | `true` | Fail if routes aren't prerendered |

### Precompression

Enable precompression to serve smaller files:

~~~js
adapter: adapter({
  precompress: true
})
~~~

This creates `.gz` and `.br` versions of your assets. Your hosting platform must support serving precompressed files.

## Single-Page App Mode

If you want a single-page app (SPA) instead of a fully static site, set a fallback page:

~~~js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      fallback: '404.html'
    })
  }
};
~~~

Then disable SSR and prerendering:

~~~js
// src/routes/+layout.js
export const ssr = false;
export const prerender = false;
~~~

With this setup:
- Only the fallback page is prerendered
- All other routes are handled client-side
- The app works like a traditional SPA

### SPA Trade-offs

| Advantage | Disadvantage |
|---|---|
| No server required | Slower initial load |
| Works offline with service worker | Worse SEO |
| Simpler hosting | Requires JavaScript |

## Handling Non-Prerenderable Pages

If some pages can't be prerendered (e.g., user dashboards), you have options:

### Option 1: Use a Fallback Page

~~~js
adapter: adapter({
  fallback: 'app.html'
})
~~~

Set `prerender = false` on those routes:

~~~js
// src/routes/dashboard/+page.js
export const prerender = false;
~~~

### Option 2: Disable Strict Mode

~~~js
adapter: adapter({
  strict: false
})
~~~

This allows non-prerendered routes but may produce unexpected results.

## GitHub Pages Deployment

GitHub Pages is a popular free host for static sites.

### Step 1: Configure Base Path

If your repo is `username/my-app`, set the base path:

~~~js
// svelte.config.js
export default {
  kit: {
    paths: {
      base: process.argv.includes('dev') ? '' : '/my-app'
    }
  }
};
~~~

### Step 2: Configure Adapter

~~~js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build'
    })
  }
};
~~~

### Step 3: Add GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

~~~yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: build

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
~~~

### Step 4: Enable GitHub Pages

1. Go to your repo → Settings → Pages
2. Under "Source", select "GitHub Actions"
3. Push to main — the workflow will build and deploy

## Netlify Deployment

For Netlify, use these settings:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Publish directory | `build` |

Or add a `netlify.toml`:

~~~toml
[build]
  command = "npm run build"
  publish = "build"
~~~

## Cloudflare Pages Deployment

For Cloudflare Pages, use these settings:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `build` |

## Troubleshooting

### Error: 404 on a Route

This means a route wasn't prerendered. Solutions:

1. Add the route to `entries` in your layout
2. Set `prerender = true` on that route
3. Use a fallback page for SPA mode

### Error: Cannot Prerender Dynamic Route

You need to provide `entries` for dynamic routes:

~~~js
export function entries() {
  return [{ slug: 'post-1' }, { slug: 'post-2' }];
}
~~~

### Assets Not Loading

Check your `paths.base` configuration. If deploying to a subdirectory, you need to set the base path.

### Form Actions Not Working

Form actions require a server. For static sites, use a third-party service like Formspree or Netlify Forms.

## When to Use Static Sites

| Use Case | Static? |
|---|---|
| Blog or documentation | ✅ Yes |
| Marketing site | ✅ Yes |
| Portfolio | ✅ Yes |
| E-commerce with dynamic inventory | ❌ No |
| User dashboard | ❌ No |
| Real-time chat | ❌ No |

## Summary

| Concept | Purpose |
|---|---|
| `adapter-static` | Generates static HTML files |
| `prerender = true` | Marks a route for prerendering |
| `entries()` | Specifies which dynamic routes to prerender |
| `fallback` | Enables SPA mode |
| `precompress` | Creates gzip/brotli versions |

## Next Steps

Learn how to deploy to a traditional server with [Node Servers](/build-and-deploy/node-servers/).
