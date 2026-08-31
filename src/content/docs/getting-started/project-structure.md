---
title: Project Structure
description: Understand the folder structure and key files in a SvelteKit project
---

# Project Structure

A typical SvelteKit project has the following structure:

~~~
my-project/
├ src/
│   ├ lib/
│   │   ├ server/
│   │   │   └ [your server-only lib files]
│   │   └ [your lib files]
│   ├ params/
│   │   └ [your param matchers]
│   ├ routes/
│   │   └ [your routes]
│   ├ app.html
│   ├ error.html
│   ├ hooks.client.js
│   ├ hooks.server.js
│   └ service-worker.js
├ static/
│   └ [your static assets]
├ tests/
│   └ [your tests]
├ package.json
├ svelte.config.js
├ tsconfig.json
└ vite.config.js
~~~

## The `src` Directory

The `src/` directory contains all of your application's source code. It has three important subdirectories and a few required files.

### `src/routes`

This is the heart of your SvelteKit app. Each file in this directory creates a route in your application. Routes are covered in detail in the [Basic Routing](/getting-started/basic-routing/) page.

### `src/lib`

This directory contains your library code — components, utilities, stores, and other shared code. There are two important rules about `src/lib`:

- Everything inside `src/lib` is aliased to `$lib` in your imports
- Files inside `src/lib/server` are **never** exposed to the client — they can safely contain secrets and API keys

~~~js
// Instead of this:
import { MyComponent } from '../components/MyComponent.svelte';

// You can write this:
import { MyComponent } from '$lib/components/MyComponent.svelte';
~~~

### `src/params`

This directory contains **param matchers** — functions used to validate route parameters. For example, a matcher can ensure that a route like `/products/[id]` only matches when `id` is a number.

## Key Files in `src`

### `app.html`

This is your page template — the HTML shell that wraps every page. It must contain the following placeholders:

- `%sveltekit.head%` — where `<head>` content is injected
- `%sveltekit.body%` — where the page content is rendered

~~~html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
~~~

### `error.html`

An optional fallback page rendered when your app encounters an error. It should contain `%sveltekit.status%` and `%sveltekit.error.message%` placeholders.

### `hooks.server.js` and `hooks.client.js`

Optional files that let you run code at key points in your app's lifecycle — such as handling authentication, modifying responses, or catching errors.

## The `static` Directory

Any files placed in `static/` are served directly at the root path. For example, `static/images/logo.png` would be accessible at `/images/logo.png`. This is a good place for favicons, `robots.txt`, and other static assets.

## Configuration Files

### `svelte.config.js`

Contains your Svelte and SvelteKit configuration, including adapter settings and preprocessor options.

### `vite.config.js`

Standard Vite configuration. SvelteKit is built on Vite, so this file lets you configure dev server options, plugins, and build settings.

### `tsconfig.json` or `jsconfig.json`

TypeScript (or JavaScript) configuration. SvelteKit generates path aliases here, such as `$lib` pointing to `src/lib`.

## Summary

| Directory / File | Purpose |
|---|---|
| `src/routes/` | Your application's pages and endpoints |
| `src/lib/` | Shared library code (aliased as `$lib`) |
| `src/lib/server/` | Server-only code (never sent to the client) |
| `src/params/` | Route parameter matchers |
| `src/app.html` | The HTML page template |
| `static/` | Static assets served at the root |
| `svelte.config.js` | SvelteKit configuration |
| `vite.config.js` | Vite configuration |

Now that you understand the project structure, you're ready to start building routes.
