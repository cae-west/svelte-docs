---
title: Configuration
description: Complete reference for svelte.config.js configuration options
---

# Configuration

SvelteKit is configured through a `svelte.config.js` file at the root of your project. This page documents all available configuration options.

## Basic Configuration

A minimal configuration file:

~~~js
// svelte.config.js
import adapter from '@sveltejs/adapter-auto';

export default {
  kit: {
    adapter: adapter()
  }
};
~~~

## Complete Configuration Reference

### `kit.adapter`

**Type:** `Adapter`

**Required:** Yes

The adapter that transforms your built app for your hosting platform.

**Example:**

~~~js
import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter({
      out: 'build',
      precompress: true
    })
  }
};
~~~

**Common adapters:**

- `@sveltejs/adapter-auto` — Auto-detects platform
- `@sveltejs/adapter-node` — Node.js server
- `@sveltejs/adapter-static` — Static site generation
- `@sveltejs/adapter-vercel` — Vercel
- `@sveltejs/adapter-netlify` — Netlify
- `@sveltejs/adapter-cloudflare` — Cloudflare Pages

### `kit.alias`

**Type:** `Record<string, string>`

**Default:** `{}`

Create import aliases for directories in your project.

**Example:**

~~~js
export default {
  kit: {
    alias: {
      'components': 'src/lib/components',
      'utils': 'src/lib/utils',
      '$types': 'src/types'
    }
  }
};
~~~

**Usage:**

~~~js
// Instead of:
import Button from '../../../lib/components/Button.svelte';

// You can use:
import Button from 'components/Button.svelte';
~~~

**Note:** `$lib` is automatically aliased to `src/lib`.

### `kit.appDir`

**Type:** `string`

**Default:** `'_app'`

The directory where SvelteKit writes built assets. Must not conflict with your static files.

**Example:**

~~~js
export default {
  kit: {
    appDir: 'internal'
  }
};
~~~

This changes the asset path from `/_app/...` to `/internal/...`.

### `kit.csp`

**Type:** `object`

**Default:** `{}`

Content Security Policy configuration.

**Example:**

~~~js
export default {
  kit: {
    csp: {
      mode: 'hash', // or 'nonce' or 'auto'
      directives: {
        'script-src': ['self'],
        'style-src': ['self', 'unsafe-inline']
      },
      reportOnly: {
        'report-uri': ['/csp-report']
      }
    }
  }
};
~~~

**Modes:**

- `auto` — Use nonce for SSR, hash for prerendered pages
- `hash` — Use SHA-256 hashes
- `nonce` — Use cryptographic nonces

### `kit.csrf`

**Type:** `object`

**Default:** `{ checkOrigin: true }`

CSRF protection configuration.

**Example:**

~~~js
export default {
  kit: {
    csrf: {
      checkOrigin: true
    }
  }
};
~~`

**Options:**

- `checkOrigin` — If `true`, checks that the `Origin` header matches the expected origin

### `kit.env`

**Type:** `object`

**Default:** `{}`

Environment variable configuration.

**Example:**

~~~js
export default {
  kit: {
    env: {
      dir: process.cwd(),
      publicPrefix: 'PUBLIC_',
      privatePrefix: ''
    }
  }
};
~~~

**Options:**

- `dir` — Directory to look for `.env` files
- `publicPrefix` — Prefix for public environment variables
- `privatePrefix` — Prefix for private environment variables

### `kit.files`

**Type:** `object`

**Default:** See below

Configure file locations in your project.

**Example:**

~~~js
export default {
  kit: {
    files: {
      assets: 'static',
      hooks: {
        client: 'src/hooks.client',
        server: 'src/hooks.server',
        universal: 'src/hooks'
      },
      lib: 'src/lib',
      params: 'src/params',
      routes: 'src/routes',
      serviceWorker: 'src/service-worker',
      appTemplate: 'src/app.html',
      errorTemplate: 'src/error.html'
    }
  }
};
~~~

**Options:**

- `assets` — Static files directory
- `hooks.client` — Client hooks file (without extension)
- `hooks.server` — Server hooks file (without extension)
- `hooks.universal` — Universal hooks file (without extension)
- `lib` — Library code directory
- `params` — Route parameter matchers directory
- `routes` — Routes directory
- `serviceWorker` — Service worker file
- `appTemplate` — HTML template file
- `errorTemplate` — Error page template

### `kit.moduleExtensions`

**Type:** `string[]`

**Default:** `['.js', '.ts']`

File extensions that SvelteKit treats as modules.

**Example:**

~~~js
export default {
  kit: {
    moduleExtensions: ['.js', '.ts', '.mjs']
  }
};
~~~

### `kit.outDir`

**Type:** `string`

**Default:** `'.svelte-kit'`

The directory where SvelteKit writes generated files.

**Example:**

~~~js
export default {
  kit: {
    outDir: '.custom-kit'
  }
};
~~~

### `kit.paths`

**Type:** `object`

**Default:** `{}`

Configure base paths for assets and routes.

**Example:**

~~~js
export default {
  kit: {
    paths: {
      base: '/app',
      assets: 'https://cdn.example.com',
      relative: false
    }
  }
};
~~~

**Options:**

- `base` — Base path for all routes (e.g., `/app` makes routes accessible at `/app/...`)
- `assets` — Base path for assets (useful for CDN)
- `relative` — If `true`, use relative paths instead of absolute paths

### `kit.prerender`

**Type:** `object`

**Default:** See below

Prerendering configuration.

**Example:**

~~~js
export default {
  kit: {
    prerender: {
      concurrency: 1,
      crawl: true,
      entries: ['*'],
      handleHttpError: 'fail',
      handleMissingId: 'fail',
      handleEntryGeneratorMismatch: 'fail',
      origin: 'https://example.com'
    }
  }
};
~~~

**Options:**

- `concurrency` — Number of pages to prerender simultaneously
- `crawl` — If `true`, crawl links to discover pages to prerender
- `entries` — List of pages to start crawling from (`['*']` means all)
- `handleHttpError` — What to do on HTTP errors: `'fail'`, `'warn'`, `'ignore'`, or a function
- `handleMissingId` — What to do on missing `id` attributes
- `handleEntryGeneratorMismatch` — What to do on entry generator mismatches
- `origin` — Origin to use for relative URLs during prerendering

### `kit.router`

**Type:** `object`

**Default:** `{ type: 'client' }`

Router configuration.

**Example:**

~~~js
export default {
  kit: {
    router: {
      type: 'client' // or 'server'
    }
  }
};
~~~

**Options:**

- `type` — Router type: `'client'` (default) or `'server'`

### `kit.serviceWorker`

**Type:** `object`

**Default:** `{}`

Service worker configuration.

**Example:**

~~~js
export default {
  kit: {
    serviceWorker: {
      register: true
    }
  }
};
~~~

**Options:**

- `register` — If `true`, automatically register the service worker

### `kit.typescript`

**Type:** `object`

**Default:** `{}`

TypeScript configuration.

**Example:**

~~~js
export default {
  kit: {
    typescript: {
      config: (config) => ({
        ...config,
        compilerOptions: {
          ...config.compilerOptions,
          strict: true
        }
      })
    }
  }
};
~~~

**Options:**

- `config` — Function to modify the generated `tsconfig.json`

## Complete Example

Here's a complete configuration file with all options:

~~~js
// svelte.config.js
import adapter from '@sveltejs/adapter-node';

export default {
  // Svelte compiler options
  compilerOptions: {
    runes: true
  },

  // SvelteKit configuration
  kit: {
    // Adapter
    adapter: adapter({
      out: 'build',
      precompress: true,
      polyfill: true
    }),

    // Import aliases
    alias: {
      '$components': 'src/lib/components',
      '$utils': 'src/lib/utils'
    },

    // Asset directory
    appDir: '_app',

    // Content Security Policy
    csp: {
      mode: 'auto',
      directives: {
        'default-src': ['self'],
        'script-src': ['self'],
        'style-src': ['self', 'unsafe-inline']
      }
    },

    // CSRF protection
    csrf: {
      checkOrigin: true
    },

    // Environment variables
    env: {
      publicPrefix: 'PUBLIC_',
      privatePrefix: ''
    },

    // File locations
    files: {
      assets: 'static',
      hooks: {
        client: 'src/hooks.client',
        server: 'src/hooks.server'
      },
      lib: 'src/lib',
      routes: 'src/routes',
      appTemplate: 'src/app.html'
    },

    // Module extensions
    moduleExtensions: ['.js', '.ts'],

    // Output directory
    outDir: '.svelte-kit',

    // Paths
    paths: {
      base: '',
      assets: '',
      relative: true
    },

    // Prerendering
    prerender: {
      concurrency: 1,
      crawl: true,
      entries: ['*'],
      handleHttpError: 'fail'
    },

    // Router
    router: {
      type: 'client'
    },

    // Service worker
    serviceWorker: {
      register: true
    },

    // TypeScript
    typescript: {
      config: (config) => config
    }
  }
};
~~~

## Related Documentation

- [Adapters](/build-and-deploy/adapters/) — Learn about different adapters
- [Project Structure](/getting-started/project-structure/) — Understand file locations
- [Environment Variables](/core-concepts/page-options/) — Using environment variables

## Next Steps

Learn about the SvelteKit CLI in [Command Line Interface](/reference/command-line-interface/).
