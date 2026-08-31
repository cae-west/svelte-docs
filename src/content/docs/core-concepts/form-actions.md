---
title: Form Actions
description: Handle form submissions and user input with server-side form actions
---


Form actions let you handle form submissions with server-side code. They provide a progressive enhancement approach — forms work even without JavaScript, and you can enhance them with client-side interactivity.

## Basic Form

Create a form in your page component:

~~~svelte
<!-- src/routes/login/+page.svelte -->
<form method="POST">
  <label>
    Email
    <input name="email" type="email" />
  </label>

  <label>
    Password
    <input name="password" type="password" />
  </label>

  <button>Log in</button>
</form>
~~~

Then handle the submission in +page.server.js:

~~~js
// src/routes/login/+page.server.js
export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');

    // Validate and authenticate user
    const user = await authenticateUser(email, password);

    if (!user) {
      return { failure: true, message: 'Invalid credentials' };
    }

    cookies.set('session', user.sessionId, { path: '/' });

    throw redirect(303, '/dashboard');
  }
};
~~~

## Named Actions

If a page has multiple forms, use named actions:

~~~svelte
<form method="POST" action="?/login">
  <!-- login form -->
</form>

<form method="POST" action="?/register">
  <!-- register form -->
</form>
~~~

Handle each action separately:

~~~js
export const actions = {
  login: async ({ request }) => {
    // handle login
  },
  register: async ({ request }) => {
    // handle registration
  }
};
~~~

## Validation

Return validation errors to show them in the form:

~~~js
export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email');

    if (!email || !email.includes('@')) {
      return {
        failure: true,
        errors: { email: 'Please enter a valid email' }
      };
    }

    // success
    return { success: true };
  }
};
~~~

Display errors in your component:

~~~svelte
<script>
  import { enhance } from '$app/forms';
  let { form } = $props();
</script>

<form method="POST" use:enhance>
  <input name="email" type="email" />
  {#if form?.errors?.email}
    <p class="error">{form.errors.email}</p>
  {/if}
</form>
~~~

## Progressive Enhancement

Use the enhance action to add client-side behavior without breaking the form for users without JavaScript:

~~~svelte
<script>
  import { enhance } from '$app/forms';
</script>

<form method="POST" use:enhance>
  <input name="email" type="email" />
  <button>Submit</button>
</form>
~~~

Customize the enhancement:

~~~svelte
<form
  method="POST"
  use:enhance={() => {
    return ({ update }) => {
      // Show loading state
      loading = true;

      update({
        reset: false,
        onError: (error) => {
          console.error(error);
        },
        onSuccess: () => {
          loading = false;
        }
      });
    };
  }}
>
~~~

## File Uploads

Handle file uploads by setting enctype="multipart/form-data":

~~~svelte
<form method="POST" enctype="multipart/form-data">
  <input type="file" name="avatar" accept="image/*" />
  <button>Upload</button>
</form>
~~~

Process the file on the server:

~~~js
export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const file = data.get('avatar');

    if (file instanceof File) {
      // Process the file
      const buffer = await file.arrayBuffer();
      // Save to storage...
    }

    return { success: true };
  }
};
~~~

## Redirect After Submission

After a successful form submission, redirect the user to prevent duplicate submissions:

~~~js
import { redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();

    // Process the form...

    throw redirect(303, '/success');
  }
};
~~~

## Error Handling

Handle errors in form actions:

~~~js
import { fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();

    try {
      await processForm(data);
    } catch (error) {
      return fail(500, { error: 'Failed to process form' });
    }

    return { success: true };
  }
};
~~~

## Summary

| Feature | Purpose |
|---|---|
| actions | Define form handlers |
| Named actions | Multiple forms per page |
| enhance | Progressive enhancement |
| Validation | Return errors to the form |
| File uploads | Use multipart/form-data |

## Next Steps

Learn how to manage application state with [State Management](/core-concepts/state-management/).
