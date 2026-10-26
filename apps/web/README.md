# Scroll Smith web app

The web app provides a character dashboard, a guided character creation flow, and read-only character details.

## Local development

Run the API and web app in separate terminals:

```sh
pnpm dev:api
pnpm dev:web
```

The web development server proxies `/api` requests to `http://localhost:3000`. Set `API_PROXY_TARGET` when the API runs at a different address. For deployment, route `/api` to the API server from the web server or set `VITE_API_BASE_URL` to a same-origin API base path; it defaults to `/api`.
