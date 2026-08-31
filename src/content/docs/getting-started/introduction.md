---
title: Introduction
description: Learn what Svelte and SvelteKit are, why they matter, and what you'll build
---


Welcome to the Svelte documentation. This guide will teach you how to build fast, modern web applications with less code and better performance.

## What is Svelte?

Svelte is a **compiler** for building user interfaces. Unlike traditional frameworks like React or Vue that do most of their work in the browser, Svelte shifts that work to a compile step that happens when you build your app.

The result? Your application ships less JavaScript, runs faster, and uses less memory.

### How Svelte Works

When you write a Svelte component, the compiler transforms it into highly optimized JavaScript that directly manipulates the DOM. There's no virtual DOM, no runtime overhead, and no framework code shipped to your users.

~~~svelte
<script>
  let count = 0;

  function increment() {
    count += 1;
  }
</script>

<button on:click={increment}>
  Clicks: {count}
</button>
~~~

This simple counter component compiles to just a few lines of vanilla JavaScript — no framework runtime required.

### Why Choose Svelte?

- **Smaller bundles** — Ship less JavaScript to your users
- **Better performance** — No virtual DOM diffing overhead
- **Less boilerplate** — Write more intuitive, reactive code
- **Built-in animations** — Transition and animate elements with minimal code
- **Accessibility** — Compiler warnings help you catch a11y issues early

## What is SvelteKit?

SvelteKit is the official **application framework** for Svelte. If Svelte is the UI layer, SvelteKit provides everything else you need to build a complete web application:

- **File-based routing** — Create routes by adding files to your project
- **Server-side rendering (SSR)** — Render pages on the server for better SEO and performance
- **Data loading** — Fetch data for your pages with built-in `load` functions
- **Form handling** — Process form submissions with form actions
- **Code splitting** — Automatically split your code for faster page loads
- **Adapters** — Deploy to any platform: Node.js, serverless, static hosting, and more

Think of it this way: **Svelte** helps you build components, while **SvelteKit** helps you build applications.

## What You'll Learn

This documentation is organized into progressive sections that build on each other:

### Getting Started

You'll learn the fundamentals of SvelteKit development:

- **Creating a Project** — Set up your development environment
- **Project Structure** — Understand where things go and why
- **Basic Routing** — Create pages and navigate between them
- **Building Your App** — Prepare your app for production

### Core Concepts

Once you understand the basics, you'll explore essential features:

- **Loading Data** — Fetch data from APIs and databases
- **Form Actions** — Handle user input and form submissions
- **State Management** — Share data across components
- **Error Handling** — Gracefully handle errors and edge cases

### Advanced Topics

Ready for more? Dive into advanced patterns:

- **Hooks** — Customize your app's behavior at key lifecycle points
- **Service Workers** — Build offline-capable applications
- **Packaging** — Create reusable component libraries
- **Adapters** — Deploy to specific platforms

## Who This Documentation Is For

This documentation assumes you have:

- **Basic HTML and CSS knowledge** — You understand how to structure and style web pages
- **JavaScript fundamentals** — You're comfortable with variables, functions, objects, and arrays
- **Command line experience** — You can navigate directories and run commands in a terminal
- **A code editor** — You have VS Code, Sublime Text, or another editor installed

You **don't need** prior experience with:

- Svelte or SvelteKit (we'll teach you everything)
- Other frameworks like React or Vue (helpful but not required)
- Server-side programming (SvelteKit handles the complexity)

## Your First Steps

Ready to get started? Here's what to do next:

1. **Create your first project** — Learn how to scaffold a new SvelteKit app
2. **Explore the project structure** — Understand where files go and why
3. **Build your first route** — Create a page and see it in the browser
4. **Deploy to production** — Share your app with the world

Each section includes working code examples you can copy, paste, and modify. We recommend following along in your own project as you read.

## Need Help?

If you get stuck or have questions:

- **Check the examples** — Each concept includes a working code sample
- **Read the API reference** — Detailed documentation for every feature
- **Join the community** — Connect with other Svelte developers on Discord
- **Report issues** — Help us improve the documentation on GitHub

## Next Steps

You're ready to begin! Head to [Creating a Project](/getting-started/creating-a-project/) to set up your first SvelteKit application.
