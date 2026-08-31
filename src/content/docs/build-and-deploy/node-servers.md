---
title: Node Servers
description: Deploy your SvelteKit app to a traditional Node.js server using adapter-node
---

# Node Servers

If you need to run your SvelteKit app on a traditional Node.js server — whether on a VPS, a cloud VM, or in a Docker container — `adapter-node` is the adapter for you. It produces a standalone Node.js server that you can run with a single command.

## Installing the Adapter

Install `adapter-node`:

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

## Building Your App

Run the build command:

~~~bash
npm run build
~~~

This produces a `build/` directory (by default) with this structure:

~~~
build/
├ index.js          → Entry point for the server
├ handler.js        → Request handler
├ server/           → Server-side code
│   └ index.js
├ client/           → Static assets for the browser
│   └ _app/
└ package.json      → Dependencies for the server
~~~

## Running the Server

Start the server with Node:

~~~bash
node build
~~~

By default, the server listens on port 3000. Open `http://localhost:3000` to see your app.

### Changing the Port

Set the `PORT` environment variable:

~~~bash
PORT=8080 node build
~~~

Or in your code:

~~~bash
PORT=8080 HOST=0.0.0.0 node build
~~~

## Configuration Options

Configure the adapter in `svelte.config.js`:

~~~js
import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter({
      out: 'build',
      precompress: false,
      envPrefix: '',
      polyfill: true
    })
  }
};
~~~

| Option | Default | Description |
|---|---|---|
| `out` | `'build'` | Output directory |
| `precompress` | `false` | Pre-compress assets with gzip and brotli |
| `envPrefix` | `''` | Prefix for environment variables |
| `polyfill` | `true` | Polyfill Node.js globals for edge runtimes |

### Precompression

Enable precompression to serve smaller files:

~~~js
adapter: adapter({
  precompress: true
})
~~~

This creates `.gz` and `.br` versions of your static assets. The server automatically serves the compressed version when the client supports it.

## Environment Variables

The server reads environment variables for configuration:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port to listen on |
| `HOST` | `0.0.0.0` | Host to bind to |
| `ORIGIN` | — | Expected origin for CSRF protection |
| `BODY_SIZE_LIMIT` | `524288` | Max request body size in bytes |

### Setting Environment Variables

On Linux/macOS:

~~~bash
PORT=8080 HOST=0.0.0.0 ORIGIN=https://example.com node build
~~~

On Windows (PowerShell):

~~~powershell
$env:PORT="8080"
$env:HOST="0.0.0.0"
$env:ORIGIN="https://example.com"
node build
~~~

Using a `.env` file with `dotenv`:

~~~bash
npm install dotenv
node -r dotenv/config build
~~~

## Custom Server

If you need more control, you can create a custom server that uses SvelteKit's handler:

~~~js
// custom-server.js
import { handler } from './build/handler.js';
import express from 'express';

const app = express();

// Add custom middleware
app.get('/health', (req, res) => {
  res.end('ok');
});

// Let SvelteKit handle everything else
app.use(handler);

app.listen(3000);
~~~

This lets you add custom routes, middleware, or integrate with frameworks like Express.

## Running Behind a Reverse Proxy

In production, you'll typically run your Node.js server behind a reverse proxy like Nginx or Caddy.

### Nginx Configuration

~~~nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
~~~

### Setting the ORIGIN

When behind a proxy, set the `ORIGIN` environment variable to your public URL:

~~~bash
ORIGIN=https://example.com node build
~~~

This is required for CSRF protection to work correctly.

## Docker Deployment

Docker is a popular way to deploy Node.js apps. Here's a production-ready Dockerfile:

### Multi-Stage Build

~~~dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/package.json .
RUN npm ci --production
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "build"]
~~~

### Docker Compose

~~~yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - ORIGIN=https://example.com
      - PORT=3000
    restart: unless-stopped
~~~

### Building and Running

~~~bash
docker build -t my-svelte-app .
docker run -p 3000:3000 -e ORIGIN=https://example.com my-svelte-app
~~~

## Process Management

In production, you need a process manager to keep your app running and restart it if it crashes.

### PM2

PM2 is a popular Node.js process manager:

~~~bash
npm install -g pm2
pm2 start build/index.js --name my-app
pm2 save
pm2 startup
~~~

Useful PM2 commands:

| Command | Description |
|---|---|
| `pm2 status` | Show running apps |
| `pm2 logs` | View logs |
| `pm2 restart my-app` | Restart the app |
| `pm2 stop my-app` | Stop the app |
| `pm2 delete my-app` | Remove the app |

### systemd

On Linux, you can use systemd:

~~~ini
# /etc/systemd/system/my-app.service
[Unit]
Description=My SvelteKit App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/my-app
ExecStart=/usr/bin/node build
Restart=on-failure
Environment=PORT=3000
Environment=ORIGIN=https://example.com

[Install]
WantedBy=multi-user.target
~~~

Enable and start:

~~~bash
sudo systemctl enable my-app
sudo systemctl start my-app
~~~

## HTTPS

For HTTPS, you have two options:

### Option 1: Reverse Proxy (Recommended)

Let Nginx or Caddy handle HTTPS and proxy to your Node.js server over HTTP. This is simpler and more flexible.

### Option 2: Node.js HTTPS

Use the built-in `https` module with a custom server:

~~~js
import { handler } from './build/handler.js';
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('/path/to/key.pem'),
  cert: fs.readFileSync('/path/to/cert.pem')
};

const server = https.createServer(options, handler);
server.listen(443);
~~~

## Health Checks

Add a health check endpoint for monitoring:

~~~js
// custom-server.js
import { handler } from './build/handler.js';
import express from 'express';

const app = express();

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

app.use(handler);
app.listen(3000);
~~~

## Scaling

To scale your app horizontally, run multiple instances behind a load balancer:

~~~bash
# Run 4 instances on different ports
PORT=3001 node build &
PORT=3002 node build &
PORT=3003 node build &
PORT=3004 node build &
~~~

Then configure your load balancer (Nginx, HAProxy, or a cloud load balancer) to distribute traffic across the instances.

### Session Management

When running multiple instances, sessions need to be shared. Use a session store like Redis:

~~~js
import { handler } from './build/handler.js';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const redisClient = createClient();
redisClient.connect();

const app = express();
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: 'your-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(handler);
~~~

## Production Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Set the `ORIGIN` environment variable
- [ ] Enable precompression (`precompress: true`)
- [ ] Use a process manager (PM2, systemd)
- [ ] Set up HTTPS (via reverse proxy)
- [ ] Configure logging and monitoring
- [ ] Set up health checks
- [ ] Configure a reverse proxy (Nginx, Caddy)
- [ ] Set up automatic restarts on failure
- [ ] Review security headers

## Summary

| Concept | Purpose |
|---|---|
| `adapter-node` | Produces a Node.js server |
| `PORT` / `HOST` | Configure the server address |
| `ORIGIN` | CSRF protection |
| Custom server | Add middleware and custom routes |
| Reverse proxy | Handle HTTPS and static files |
| Process manager | Keep the app running |

## Next Steps

Next, explore [Advanced Routing](/advanced/advanced-routing/) to learn more advanced topics.
