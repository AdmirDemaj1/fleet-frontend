# admin

## Installation

Install the application dependencies by running:

```sh
npm install
```

## Development

Start the application in development mode by running:

```sh
npm run dev
```

## Production

Build the application in production mode by running:

```sh
npm run build
```

- To run in production mode:

```sh
npm run dev -- --mode production
```

- To run in dev mode:

```sh
npm run dev -- --mode development
```


## Landing page analytics (Axiom)

Every visit to the landing page (`/`) sends an anonymous `landing_page_view` event
to `/api/track` (a Vercel serverless function), which forwards it to Axiom.
The Axiom token is only ever in server-side env vars.

Set in Vercel (Project -> Settings -> Environment Variables), then redeploy:

| Variable | Required | Notes |
|---|---|---|
| `AXIOM_TOKEN` | yes | Ingest-only API token scoped to the dataset |
| `AXIOM_DATASET` | yes | e.g. `fleet-landing` |
| `AXIOM_URL` | no | Default `https://api.axiom.co`; EU edge: `https://eu-central-1.aws.edge.axiom.co` |
| `ANALYTICS_SALT` | no | Random secret mixed into the daily visitor hash |
| `VITE_ANALYTICS_ENABLED` | no | Set `false` to switch tracking off in the browser |

Privacy: no cookies, no raw IP or full user agent stored. Visitors are a daily-rotating
salted hash; the session id lives in `sessionStorage`. Do Not Track is respected, bots are
dropped, and tracking is off in local development.
