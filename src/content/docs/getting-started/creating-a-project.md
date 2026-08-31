---
title: Creating a Project
description: Learn how to scaffold and set up your first SvelteKit project
---


The easiest way to start building a SvelteKit app is to use the official CLI tool.

## Quick Start

Run these commands in your terminal:

~~~bash
npx sv create my-app
cd my-app
npm install
npm run dev
~~~

The first command will scaffold a new project in the `my-app` directory. During setup, you'll be asked if you'd like to configure:

- **TypeScript** support
- **ESLint** for code linting
- **Prettier** for code formatting
- **Playwright** for end-to-end testing
- **Vitest** for unit testing

After the project is created, `npm run dev` starts the development server on `http://localhost:5173`.

## Project Templates

When you run `npx sv create`, you can choose from several starter templates:

- **SvelteKit minimal** — A bare-bones SvelteKit project
- **SvelteKit library** — For building component libraries
- **SvelteKit demo** — A full-featured demo app with examples

## Manual Setup

If you prefer to set up your project manually, you can:

1. Create a new directory: `mkdir my-app && cd my-app`
2. Initialize a package.json: `npm init -y`
3. Install SvelteKit: `npm install -D @sveltejs/kit vite`
4. Create the necessary config files

However, using `npx sv create` is recommended for most users as it handles all the configuration automatically.

## Next Steps

Once your project is created and the dev server is running, you're ready to explore the project structure and start building your app.
