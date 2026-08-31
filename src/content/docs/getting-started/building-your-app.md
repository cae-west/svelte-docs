---
title: Building Your App
description: Learn how to build your SvelteKit app for production
---


So far, everything you've done has run in development mode using `npm run dev`. When you're ready to ship your application to production, you need to build it.

## Building for Production

To create a production build, run:

~~~bash
npm run build
~~~

This command:
1. Compiles your Svelte components into optimized JavaScript
2. Bundles your code using Vite
3. Generates static assets in the `build/` directory (or the directory configured by your adapter)

You'll see output like this:

~~~
> my-app@0.0.1 build
> vite build

vite v5.x.x building for production...
✓ 123 modules transformed.
.svelte-kit/output/client/_app/immutable/assets/...  12.34 kB
.svelte-kit/output/server/...                         45.67 kB
✓ built in 2.34s
~~~

## Previewing the Build

Before deploying, you should test your production build locally. Run:

~~~bash
npm run preview
~~~

This starts a local server that serves your built app. Visit `http://localhost:4173` to see it in action.

## Adapters

SvelteKit is designed to run anywhere — Node.js, serverless platforms, static hosts, and more. **Adapters** are plugins that take your build output and convert it for your target platform.

### Installing an Adapter

First, install the adapter for your platform. For example, for Node.js:

~~~bash
npm install -D @sveltejs/adapter-node
~~~

Then update your `svelte.config.js`:

~~~js
import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter()
  }
};
~~~

### Common Adapters

| Adapter | Target Platform |
|---|---|
| `@sveltejs/adapter-node` | Node.js servers |
| `@sveltejs/adapter-static` | Static site hosts (GitHub Pages, Netlify) |
| `@sveltejs/adapter-vercel` | Vercel |
| `@sveltejs/adapter-netlify` | Netlify |
| `@sveltejs/adapter-cloudflare` | Cloudflare Pages |
| `@sveltejs/adapter-auto` | Auto-detects your platform |

### Adapter Auto

If you're not sure which adapter to use, `@sveltejs/adapter-auto` is installed by default. It detects your deployment environment and applies the right adapter automatically.

~~~js
import adapter from '@sveltejs/adapter-auto';

export default {
  kit: {
    adapter: adapter()
  }
};
~~~

## Static Site Generation

If your app doesn't need a server (no server-side rendering or API routes), you can generate a fully static site. Install the static adapter:

~~~bash
npm install -D @sveltejs/adapter-static
~~~

Then configure it in `svelte.config.js`:

~~~js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: null
    })
  }
};
~~~

## Environment Variables

Your build can use environment variables for configuration. SvelteKit exposes these through the `$env` modules:

~~~js
import { env } from '$env/dynamic/private';
import { publicEnv } from '$env/static/public';
~~~

- `$env/static/public` — Public variables available at build time (prefixed with `PUBLIC_`)
- `$env/static/private` — Private variables available at build time
- `$env/dynamic/public` — Public variables available at runtime
- `$env/dynamic/private` — Private variables available at runtime

## Build Configuration

You can customize your build in `svelte.config.js`:

~~~js
export default {
  kit: {
    // Change the output directory
    out: 'build',

    // Configure path aliases
    alias: {
      '$components': 'src/lib/components'
    },

    // Configure the adapter
    adapter: adapter()
  }
};
~~~

## Deployment Checklist

Before deploying your app, make sure you've:

- [ ] Chosen and installed the right adapter
- [ ] Tested the build locally with `npm run preview`
- [ ] Set up environment variables for your production environment
- [ ] Configured any custom domains or routing rules
- [ ] Enabled HTTPS in production
- [ ] Set up monitoring and error tracking

## Next Steps

Congratulations! You've completed the Getting Started guide. You now know how to:

- Create a SvelteKit project
- Understand the project structure
- Build routes and pages
- Build your app for production

To continue learning, explore these topics:

- **Loading Data** — Fetch data for your pages
- **Form Actions** — Handle form submissions
- **State Management** — Manage application state
- **Hooks** — Customize your app's behavior
