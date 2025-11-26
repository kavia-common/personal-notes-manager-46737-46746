# Welcome to Remix!

- 📖 [Remix docs](https://remix.run/docs)

## Development

Run the dev server (Vite) on port 3000:

```shell
npm install
npm run dev
```

The app listens on `http://localhost:3000` (hosted on `0.0.0.0` for container environments).

Environment variables are optional for local-only mode. If you don't set any backend URL, the app will store notes in `localStorage`. If you have a backend, you can set one of:
- `VITE_API_BASE` (preferred)
- `VITE_BACKEND_URL`

If unset, the app will gracefully fall back to local mode.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Make sure to deploy the output of `npm run build`:

- `build/server`
- `build/client`

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever css framework you prefer. See the [Vite docs on css](https://vitejs.dev/guide/features.html#css) for more information.

## Troubleshooting

- If the dev server fails to start, ensure Node.js >= 20 is installed.
- Port 3000 is required (`strictPort: true`). Stop other services using 3000 or update `vite.config.ts`.
- No `.env` is required locally. If you provide one, ensure `VITE_*` variables are valid URLs.
