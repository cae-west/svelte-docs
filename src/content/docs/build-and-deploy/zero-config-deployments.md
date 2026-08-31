---
title: Zero-Config Deployments
description: Deploy your SvelteKit app to Vercel, Netlify, and Cloudflare with adapter-auto
---


SvelteKit makes deploying to popular platforms as simple as possible. With `adapter-auto`, you can deploy your app to Vercel, Netlify, or Cloudflare Pages without any configuration — just push your code and the platform handles the rest.

## How Adapter-Auto Works

`adapter-auto` is installed by default in new SvelteKit projects. It detects your deployment environment by looking at environment variables set by the hosting platform:

~~~js
import adapter from '@sveltejs/adapter-auto';

export default {
  kit: {
    adapter: adapter()
  }
};
~~~

When you run `npm run build`, `adapter-auto` checks for these indicators:

| Environment Variable | Platform | Adapter Used |
|---|---|---|
| `VERCEL` | Vercel | `@sveltejs/adapter-vercel` |
| `NETLIFY` | Netlify | `@sveltejs/adapter-netlify` |
| `CF_PAGES` | Cloudflare Pages | `@sveltejs/adapter-cloudflare` |

If none of these are detected, it falls back to `adapter-node`.

## Deploying to Vercel

Vercel is the easiest platform to deploy to — it was built by the creator of Svelte and has first-class SvelteKit support.

### Step 1: Push Your Code to GitHub

Make sure your SvelteKit project is in a Git repository on GitHub, GitLab, or Bitbucket.

### Step 2: Import Your Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import" next to your repository
3. Vercel auto-detects SvelteKit and configures the build settings

### Step 3: Deploy

Click "Deploy". Vercel will:
- Install dependencies with `npm install`
- Run `npm run build`
- Detect SvelteKit and use the Vercel adapter
- Deploy your app to a `.vercel.app` subdomain

### Step 4: Configure Your Domain (Optional)

In the Vercel dashboard, go to your project settings and add a custom domain. Vercel handles SSL certificates automatically.

### Vercel-Specific Features

With `adapter-vercel`, you get:
- **Edge functions** — Run code at the edge for low latency
- **Serverless functions** — Automatic scaling without managing servers
- **Image optimization** — Built-in image optimization via `@vercel/og`
- **Analytics** — Real-time web analytics
- **Preview deployments** — Every pull request gets its own URL

## Deploying to Netlify

Netlify is another popular platform with excellent SvelteKit support.

### Step 1: Push Your Code to GitHub

Same as Vercel — make sure your project is in a Git repository.

### Step 2: Import Your Project

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git provider and select your repository

### Step 3: Configure Build Settings

Netlify usually auto-detects SvelteKit, but if not, use these settings:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Publish directory | `.netlify/functions` |
| Node version | 20 |

### Step 4: Deploy

Click "Deploy site". Netlify will build and deploy your app.

### Netlify-Specific Features

With `adapter-netlify`, you get:
- **Edge functions** — Run code at the edge
- **Serverless functions** — Automatic scaling
- **Forms** — Built-in form handling
- **Identity** — Built-in authentication
- **Split testing** — A/B test different deployments

## Deploying to Cloudflare Pages

Cloudflare Pages offers fast global deployment on Cloudflare's edge network.

### Step 1: Push Your Code to GitHub

Same as the other platforms.

### Step 2: Connect to Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Click "Create a project" → "Connect to Git"
3. Select your repository

### Step 3: Configure Build Settings

Use these settings:

| Setting | Value |
|---|---|
| Framework preset | SvelteKit |
| Build command | `npm run build` |
| Build output directory | `.svelte-kit/cloudflare` |

### Step 4: Deploy

Click "Save and Deploy". Cloudflare Pages builds and deploys your app.

### Cloudflare-Specific Features

With `adapter-cloudflare`, you get:
- **Workers** — Run code on Cloudflare's global network
- **KV storage** — Key-value storage at the edge
- **R2 storage** — S3-compatible object storage
- **D1 database** — Serverless SQL database
- **Low latency** — Code runs close to your users

## Environment Variables

All three platforms support environment variables for secrets and configuration:

### Vercel

1. Go to your project settings
2. Click "Environment Variables"
3. Add your variables (e.g., `DATABASE_URL`, `API_KEY`)
4. Redeploy

### Netlify

1. Go to Site settings → Environment variables
2. Add your variables
3. Redeploy

### Cloudflare Pages

1. Go to your project settings
2. Click "Variables"
3. Add your variables
4. Redeploy

## Custom Domains

All three platforms support custom domains with automatic SSL:

### Vercel

1. Go to your project → Settings → Domains
2. Add your domain
3. Follow the DNS instructions

### Netlify

1. Go to Domain settings → Add custom domain
2. Follow the DNS instructions

### Cloudflare Pages

1. Go to Custom domains → Set up a domain
2. Follow the DNS instructions

## Preview Deployments

All three platforms create preview deployments for pull requests:

- **Vercel** — Every PR gets a unique URL like `my-app-git-feature.vercel.app`
- **Netlify** — Every PR gets a deploy preview URL
- **Cloudflare Pages** — Every PR gets a preview URL

This lets you test changes before merging to production.

## Comparing Platforms

| Feature | Vercel | Netlify | Cloudflare Pages |
|---|---|---|---|
| Edge functions | ✅ | ✅ | ✅ |
| Serverless functions | ✅ | ✅ | ❌ |
| Built-in database | ❌ | ❌ | ✅ (D1) |
| Built-in storage | ❌ | ❌ | ✅ (R2, KV) |
| Free tier | Generous | Generous | Generous |
| Build minutes | 6,000/month | 300/month | 500/month |
| Bandwidth | 1 TB/month | 100 GB/month | Unlimited |

## When to Use a Specific Adapter

While `adapter-auto` works for most cases, you might want to use a specific adapter for advanced configuration:

~~~js
// Use adapter-vercel for Vercel-specific options
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter({
      runtime: 'nodejs20.x',
      regions: ['iad1', 'sfo1'],
      split: true
    })
  }
};
~~~

This gives you access to platform-specific options like:
- Choosing specific regions
- Enabling edge functions
- Configuring runtime versions
- Splitting routes into separate functions

## Troubleshooting

### Build Fails on the Platform

Check the build logs for errors. Common issues:
- Missing environment variables
- TypeScript errors
- Missing dependencies

### Wrong Adapter Detected

If `adapter-auto` picks the wrong adapter, install the specific adapter directly:

~~~bash
npm install -D @sveltejs/adapter-vercel
~~~

Then update `svelte.config.js`:

~~~js
import adapter from '@sveltejs/adapter-vercel';
~~~

### Slow Builds

- Enable build caching in your platform's settings
- Use `npm ci` instead of `npm install` for faster, reproducible installs
- Optimize your dependencies

## Summary

| Platform | Adapter | Best For |
|---|---|---|
| Vercel | `adapter-vercel` | SvelteKit apps with serverless functions |
| Netlify | `adapter-netlify` | JAMstack sites with forms and identity |
| Cloudflare Pages | `adapter-cloudflare` | Edge-first apps with Workers and D1 |

## Next Steps

Learn how to generate a fully static site with [Static Site Generation](/build-and-deploy/static-site-generation/).
