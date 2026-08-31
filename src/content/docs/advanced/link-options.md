---
title: Link Options
description: Control navigation behavior with data-sveltekit attributes for preloading, reloading, scrolling, and focus management
---


SvelteKit lets you customize how links and forms behave using `data-sveltekit-*` attributes. These attributes control preloading, full-page reloads, scroll behavior, focus management, and history handling — giving you fine-grained control over the user experience.

## How Link Options Work

Link options are applied as HTML attributes on `<a>` elements or any parent element that contains links. SvelteKit reads these attributes and adjusts its behavior accordingly.

~~~html
<!-- Apply to a single link -->
<a href="/about" data-sveltekit-preload-data>About</a>

<!-- Apply to all links inside a container -->
<nav data-sveltekit-preload-data>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/blog">Blog</a>
</nav>
~~~

## Preloading Data

The `data-sveltekit-preload-data` attribute tells SvelteKit to start loading a page's data before the user clicks the link. This makes navigation feel instant.

### Values

| Value | Behavior |
|---|---|
| `"hover"` | Preload when the user hovers over the link (desktop) or taps it (mobile). This is the **default** for all links. |
| `"tap"` | Preload only on `touchstart` or `mousedown`. More conservative — avoids unnecessary preloads. |
| `"false"` | Disable preloading for this link or container. |

### Example

~~~html
<!-- Preload on hover (default) -->
<a href="/blog/post-1" data-sveltekit-preload-data="hover">Read Post</a>

<!-- Preload only on tap/click -->
<a href="/expensive-page" data-sveltekit-preload-data="tap">View Page</a>

<!-- Disable preloading -->
<a href="/api/trigger" data-sveltekit-preload-data="false">Trigger Action</a>
~~~

### Global Configuration

Set the default preloading behavior in `app.html`:

~~~html
<body data-sveltekit-preload-data="hover">
  <div style="display: contents">%sveltekit.body%</div>
</body>
~~~

Or disable it entirely:

~~~html
<body data-sveltekit-preload-data="false">
  <div style="display: contents">%sveltekit.body%</div>
</body>
~~~

### When to Disable Preloading

Disable preloading for links that:
- Trigger expensive server operations
- Start a download
- Initiate an action (like logging out)
- Point to external resources

## Preloading Code

The `data-sveltekit-preload-code` attribute preloads the JavaScript for a route without loading its data. This is less aggressive than preloading data but still speeds up navigation.

### Values

| Value | Behavior |
|---|---|
| `"eager"` | Preload immediately when the page loads |
| `"viewport"` | Preload when the link enters the viewport |
| `"hover"` | Preload when the user hovers over the link |
| `"tap"` | Preload on `touchstart` or `mousedown` |

### Example

~~~html
<!-- Preload code when link is visible -->
<a href="/dashboard" data-sveltekit-preload-code="viewport">Dashboard</a>

<!-- Preload code immediately -->
<a href="/settings" data-sveltekit-preload-code="eager">Settings</a>
~~~

### Combining with Data Preloading

You can use both attributes together:

~~~html
<a
  href="/blog"
  data-sveltekit-preload-code="viewport"
  data-sveltekit-preload-data="hover"
>
  Blog
</a>
~~~

This preloads the code when the link is visible and preloads the data when hovered.

### Reduced Data Usage

Both `data-sveltekit-preload-data` and `data-sveltekit-preload-code` respect the user's data usage preferences. If the user has enabled reduced data mode in their browser, preloading is automatically disabled.

## Full-Page Reloads

The `data-sveltekit-reload` attribute forces SvelteKit to perform a full-page navigation instead of a client-side transition.

### Example

~~~html
<!-- Force full-page reload -->
<a href="/logout" data-sveltekit-reload>Log Out</a>

<!-- Apply to all links in a container -->
<nav data-sveltekit-reload>
  <a href="/page-1">Page 1</a>
  <a href="/page-2">Page 2</a>
</nav>
~~~

### When to Use Reload

Use `data-sveltekit-reload` when:
- Navigating to a non-SvelteKit page
- The page requires a full server render
- You need to reset all client-side state
- Working with third-party scripts that don't survive client-side navigation

### External Links

Links with `rel="external"` automatically receive full-page reload behavior:

~~~html
<a href="https://example.com" rel="external">External Site</a>
~~~

These links are also ignored during prerendering.

## Scroll Behavior

The `data-sveltekit-noscroll` attribute prevents SvelteKit from scrolling to the top of the page (or to a hash target) after navigation.

### Example

~~~html
<!-- Don't scroll to top after navigation -->
<a href="/next-page" data-sveltekit-noscroll>Next Page</a>
~~~

### Use Cases

Use `data-sveltekit-noscroll` for:
- Pagination within a scrollable container
- Tab navigation where the content area should stay in place
- Infinite scroll implementations
- Any navigation where you want to preserve scroll position

## Focus Management

The `data-sveltekit-keepfocus` attribute keeps the currently focused element focused after navigation. This is primarily useful for forms.

### Example

~~~html
<form data-sveltekit-keepfocus>
  <input type="text" name="search" />
  <button type="submit">Search</button>
</form>
~~~

### Use Cases

Use `data-sveltekit-keepfocus` for:
- Search forms that update results without losing focus
- Auto-saving forms
- Real-time filtering interfaces
- Any form where losing focus would disrupt the user's workflow

## History Management

The `data-sveltekit-replacestate` attribute replaces the current browser history entry instead of creating a new one.

### Example

~~~html
<!-- Replace history instead of pushing -->
<a href="/page-2" data-sveltekit-replacestate>Next</a>
~~~

### Use Cases

Use `data-sveltekit-replacestate` for:
- Pagination (don't create a history entry for every page)
- Filter/sort changes (don't clutter the back button)
- Redirects after form submission
- Step-by-step wizards where back should skip intermediate steps

### Example: Pagination

~~~svelte
<script>
  let { data } = $props();
</script>

<div class="pagination">
  {#if data.page > 1}
    <a
      href="?page={data.page - 1}"
      data-sveltekit-replacestate
    >
      Previous
    </a>
  {/if}

  <span>Page {data.page} of {data.totalPages}</span>

  {#if data.page < data.totalPages}
    <a
      href="?page={data.page + 1}"
      data-sveltekit-replacestate
    >
      Next
    </a>
  {/if}
</div>
~~~

## Disabling Options

To disable an option within a parent element where it was enabled, use the `"false"` value:

~~~html
<nav data-sveltekit-preload-data>
  <a href="/blog">Blog</a>
  <a href="/expensive-action" data-sveltekit-preload-data="false">
    Expensive Action
  </a>
</nav>
~~~

The first link inherits `preload-data` from the parent, but the second link explicitly disables it.

## Applying to Forms

Link options also work on `<form>` elements:

~~~html
<form method="POST" data-sveltekit-noscroll data-sveltekit-keepfocus>
  <input type="text" name="query" />
  <button type="submit">Search</button>
</form>
~~~

This form won't scroll to the top after submission and will keep focus on the input field.

## Global Configuration

Set default link options in `app.html`:

~~~html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    %sveltekit.head%
  </head>
  <body
    data-sveltekit-preload-data="hover"
    data-sveltekit-preload-code="viewport"
  >
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
~~~

These defaults apply to all links unless overridden by a more specific attribute.

## Performance Impact

### Preloading Trade-offs

| Strategy | Speed | Data Usage | False Positives |
|---|---|---|---|
| `preload-data="hover"` | Fastest | Higher | More likely |
| `preload-data="tap"` | Fast | Moderate | Less likely |
| `preload-code="viewport"` | Moderate | Low | Unlikely |
| No preloading | Slowest | Lowest | None |

### Recommendations

- **Content sites** (blogs, docs): Use `preload-data="hover"` for the best experience
- **Web apps** (dashboards, tools): Use `preload-code="viewport"` to save data
- **Mobile-first sites**: Use `preload-data="tap"` to avoid unnecessary preloads
- **Low-bandwidth users**: Disable preloading or use `preload-code="viewport"`

## Combining Options

You can combine multiple link options on a single element:

~~~html
<a
  href="/search?q=svelte"
  data-sveltekit-preload-data="hover"
  data-sveltekit-replacestate
  data-sveltekit-noscroll
>
  Search Results
</a>
~~~

This link:
- Preloads data on hover
- Replaces the history entry
- Doesn't scroll to the top

## Summary

| Attribute | Purpose | Values |
|---|---|---|
| `data-sveltekit-preload-data` | Preload page data | `"hover"`, `"tap"`, `"false"` |
| `data-sveltekit-preload-code` | Preload route code | `"eager"`, `"viewport"`, `"hover"`, `"tap"` |
| `data-sveltekit-reload` | Force full-page reload | (boolean attribute) |
| `data-sveltekit-noscroll` | Prevent scroll to top | (boolean attribute) |
| `data-sveltekit-keepfocus` | Keep focus after navigation | (boolean attribute) |
| `data-sveltekit-replacestate` | Replace history entry | (boolean attribute) |

## Next Steps

Learn about server-only modules and protecting secrets with [Server-Only Modules](/advanced/server-only-modules/).
