---
title: Adapters
description: Understand SvelteKit's adapter system and how to deploy to any platform
---

# Adapters

SvelteKit is designed to run anywhere — Node.js servers, serverless platforms, static hosts, edge networks, and more. **Adapters** are plugins that take your build output and transform it for your specific target platform.

## How Adapters Work

When you run `npm run build`, SvelteKit produces a platform-agnostic build in the `.svelte-kit/output/` directory. Your adapter then takes this output and produces the final files needed for your deployment target.

~~~
Source code → Vite build → .svelte-kit/output/ → Adapter → Final output
~~~

For example:
- `adapter-node` produces a Node.js server with `server.js` and static assets
- `adapter-static` produces HTML files ready for any static host
- `adapter-vercel` produces Vercel serverless functions

## Installing an Adapter

First, install the adapter for your platform. For example, for Node.js:

~~~bash
npm install -D @sveltejs/adapter-node
~~~

Then configure it in `svelte.config.js`:

~~~js
import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter()
  }
};
~~~

## Official Adapters

SvelteKit maintains several official adapters:

| Adapter | Target Platform |
|---|---|
| `@sveltejs/adapter-auto` | Auto-detects your platform |
| `@sveltejs/adapter-node` | Node.js servers |
| `@sveltejs/adapter-static` | Static site hosts (GitHub Pages, Netlify) |
| `@sveltejs/adapter-vercel` | Vercel |
| `@sveltejs/adapter-netlify` | Netlify |
| `@sveltejs/adapter-cloudflare` | Cloudflare Pages |
| `@sveltejs/adapter-cloudflare-workers` | Cloudflare Workers |

## Adapter Auto

If you're not sure which adapter to use, `@sveltejs/adapter-auto` is installed by default in new SvelteKit projects. It detects your deployment environment and applies the right adapter automatically.

~~~js
import adapter from '@sveltejs/adapter-auto';

export default {
  kit: {
    adapter: adapter()
  }
};
~~~

`adapter-auto` supports:
- Cloudflare Pages (via `adapter-cloudflare`)
- Netlify (via `adapter-netlify`)
- Vercel (via `adapter-vercel`)

If your platform isn't detected, it falls back to `adapter-node`.

## Adapter Node

For traditional Node.js servers, use `adapter-node`:

~~~bash
npm install -D @sveltejs/adapter-node
~~~

~~~js
import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter({
      out: 'build',
      precompress: false,
      envPrefix: ''
    })
  }
};
~~~

### Configuration Options

| Option | Default | Description |
|---|---|---|
| `out` | `'build'` | Output directory |
| `precompress` | `false` | Pre-compress assets with gzip and brotli |
| `envPrefix` | `''` | Prefix for environment variables |

After building, run your app with:

~~~bash
node build
~~~

The server listens on the `PORT` environment variable (defaults to 3000).

## Adapter Static

For fully static sites, use `adapter-static`:

~~~bash
npm install -D @sveltejs/adapter-static
~~~

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

### Configuration Options

| Option | Default | Description |
|---|---|---|
| `pages` | `'build'` | Directory for prerendered pages |
| `assets` | `'build'` | Directory for static assets |
| `fallback` | `null` | Fallback page for SPAs (e.g., `'404.html'`) |
| `precompress` | `false` | Pre-compress assets |
| `strict` | `true` | Fail if routes aren't prerendered |

### Prerendering Requirements

For `adapter-static` to work, every page must be prerendered. Set `prerender = true` in your root layout:

~~~js
// src/routes/+layout.js
export const prerender = true;
~~~

Or configure specific entries:

~~~js
// src/routes/+layout.js
export const prerender = true;
export const entries = ['/', '/about', '/blog'];
~~~

### Single-Page App Mode

If you want a single-page app with `adapter-static`, set a fallback page:

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

Then disable SSR:

~~~js
// src/routes/+layout.js
export const ssr = false;
export const prerender = false;
~~~

## Adapter Vercel

For Vercel deployments, use `adapter-vercel`:

~~~bash
npm install -D @sveltejs/adapter-vercel
~~~

~~~js
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter({
      runtime: 'nodejs20.x',
      regions: ['iad1'],
      split: false
    })
  }
};
~~~

### Configuration Options

| Option | Default | Description |
|---|---|---|
| `runtime` | `'nodejs20.x'` | Node.js runtime version |
| `regions` | `['iad1']` | Edge function regions |
| `split` | `false` | Split routes into separate functions |

## Adapter Netlify

For Netlify deployments, use `adapter-netlify`:

~~~bash
npm install -D @sveltejs/adapter-netlify
~~~

~~~js
import adapter from '@sveltejs/adapter-netlify';

export default {
  kit: {
    adapter: adapter({
      split: false,
      edge: false
    })
  }
};
~~~

## Adapter Cloudflare

For Cloudflare Pages, use `adapter-cloudflare`:

~~~bash
npm install -D @sveltejs/adapter-cloudflare
~~~

~~~js
import adapter from '@sveltejs/adapter-cloudflare';

export default {
  kit: {
    adapter: adapter({
      routes: {
        include: ['/*'],
        exclude: ['<all>']
      }
    })
  }
};
~~~

## Community Adapters

Beyond the official adapters, the community has built adapters for many other platforms:

| Adapter | Platform |
|---|---|
| `svelte-adapter-bun` | Bun |
| `svelte-adapter-deno` | Deno |
| `svelte-adapter-firebase` | Firebase Hosting |
| `svelte-adapter-azure-swa` | Azure Static Web Apps |
| `svelte-adapter-docker` | Docker containers |

Check the [SvelteKit adapters list](https://svelte.dev/docs/kit/adapters) for the full community list.

## Writing a Custom Adapter

If no adapter exists for your platform, you can write your own. An adapter is a function that returns an object with an `adapt` method:

~~~js
export function myAdapter(options = {}) {
  return {
    name: 'my-adapter',

    async adapt(builder) {
      builder.log('Building for my platform...');

      // Remove the output directory
      builder.rimraf('build');

      // Copy static assets
      builder.writeClient('build/client');
      builder.writePrerendered('build/prerendered');

      // Write server code
      builder.writeServer('build/server');

      builder.log('Done!');
    }
  };
}
~~~

### Builder Methods

The `builder` object provides these methods:

| Method | Description |
|---|---|
| `builder.log(message)` | Log a message |
| `builder.rimraf(dir)` | Remove a directory |
| `builder.mkdirp(dir)` | Create a directory |
| `builder.writeClient(dest)` | Write client assets |
| `builder.writeServer(dest)` | Write server code |
| `builder.writePrerendered(dest)` | Write prerendered pages |
| `builder.getBuildDirectory(name)` | Get a path in the build directory |
| `builder.getAppPath()` | Get the app path |

## Choosing an Adapter

Use this decision tree to pick the right adapter:

~~~
Do you need server-side rendering?
├ Yes → Do you need a serverless platform?
│   ├ Yes → Which platform?
│   │   ├ Vercel → adapter-vercel
│   │   ├ Netlify → adapter-netlify
│   │   └ Cloudflare → adapter-cloudflare
│   └ No → adapter-node
└ No → Do you need a single-page app?
    ├ Yes → adapter-static (with fallback)
    └ No → adapter-static (prerender everything)
~~~

## Summary

| Concept | Purpose |
|---|---|
| Adapter | Transforms build output for a platform |
| `adapter-auto` | Auto-detects platform |
| `adapter-node` | Node.js server |
| `adapter-static` | Static files |
| `adapter-vercel` | Vercel deployment |
| `adapter-netlify` | Netlify deployment |
| `adapter-cloudflare` | Cloudflare Pages |

## Next Steps

Learn about the easiest deployment path with [Zero-Config Deployments](/build-and-deploy/zero-config-deployments/).
